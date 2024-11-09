const buttonUsersList = document.querySelector("button.usersList");
const divGeneralChat = document.querySelector("div.generalChat");
const chatWindow = document.querySelector("section.chatWindow");
const formConnectToWebsocket = document.querySelector("form.connectToChat");
const nav = document.querySelector("nav");
const startWindow = document.querySelector("div.startWindow");
const buttonLeaveChat = document.querySelector("button.leaveChat");
const messageForm = document.querySelector("form.messageForm");
const connectToChatForm = document.querySelector("form.connectToChat");
const usernameEnter = document.querySelector("input#usernameEnter");

function joinChat(username) {
    const socket = connectToServer();
    let yourData = {
        color: getRandomColor(),
        username: username,
    };
    divGeneralChat.style.display = null;
    startWindow.style.display = "none";
    nav.style.display = null;
    openingUsersList();
    buttonUsersList.onclick = () => {
        const boxUsersList = document.querySelector("aside.usersList");
        switch (boxUsersList.style.width) {
            case "0px":
                openingUsersList();
                break;
            default:
                closingUsersList();
        }
    };
    messageForm.querySelector("textarea").focus();

    buttonLeaveChat.onclick = leaveChat;

    function scrollForBoxUser() {
        setTimeout(() => {
            const boxUsersList = document.querySelector("aside.usersList");
            const boxUsers = boxUsersList.querySelectorAll("div.user");
            boxUsers.forEach((boxUser) => {
                const divScrollThumb = boxUser.querySelector("div#scrollThumb");
                const usernameWidth = boxUser.querySelector("p").scrollWidth;
                const boxUserWidth =
                    boxUser.querySelector("div.username").offsetWidth;
                if (usernameWidth > boxUserWidth) {
                    boxUser.querySelector("div#scroll").style.display = null;
                    divScrollThumb.style.width = `${
                        (boxUserWidth / usernameWidth) * 100
                    }%`;
                    boxUser.addEventListener("wheel", myWheelForEventDefoult);
                    boxUser.querySelector("p").onscroll = () => {
                        const scrollPosition =
                            boxUser.querySelector("p").scrollLeft;
                        divScrollThumb.style.left = `${
                            (scrollPosition / usernameWidth) * 100
                        }%`;
                    };
                }
            });
        }, 500);
    }

    scrollForBoxUser();

    messageForm.querySelector("textarea").oninput = () => {
        scrollForBoxMessage();
    };

    const resizeObserver = new ResizeObserver(() => {
        scrollForBoxMessage();
    });
    resizeObserver.observe(messageForm);

    messageForm.addEventListener("submit", preventDefaultForEventListener);

    function scrollForBoxMessage() {
        const divScrollThumb = messageForm.querySelector("div#scrollThumb");
        const messageHeight =
            messageForm.querySelector("textarea").scrollHeight;
        const boxMessageHeight =
            messageForm.querySelector("textarea").clientHeight;
        if (messageHeight > boxMessageHeight) {
            messageForm.querySelector("div#scroll").style.display = null;
            divScrollThumb.style.height = `${
                (boxMessageHeight / messageHeight) * 100
            }%`;
            messageForm.querySelector("textarea").onscroll = () => {
                const scrollPosition =
                    messageForm.querySelector("textarea").scrollTop;
                divScrollThumb.style.top = `${
                    (scrollPosition / messageHeight) * 100
                }%`;
            };
        } else {
            messageForm.querySelector("div#scroll").style.display = "none";
        }
    }

    function openingUsersList() {
        const boxUsersList = document.querySelector("aside.usersList");
        const boxUsers = boxUsersList.querySelectorAll("div.user");
        boxUsersList.style.width = null;
        setTimeout(() => {
            boxUsersList.querySelector("h2").style.borderRadius = null;
        }, 400);
        setTimeout(() => {
            boxUsers.forEach((item) => {
                item.style.borderRight = null;
                item.style.margin = null;
                item.style.borderRadius = null;
            });
        }, 370);
        setTimeout(() => {
            boxUsers.forEach((item) => {
                item.querySelector(".username").style.width = null;
            });
        }, 225);
    }
    function closingUsersList() {
        const boxUsersList = document.querySelector("aside.usersList");
        const boxUsers = boxUsersList.querySelectorAll("div.user");
        boxUsersList.style.width = "0px";
        boxUsersList.querySelector("h2").style.borderRadius = "0 0 0 15px";
        boxUsers.forEach((item) => {
            item.style.borderRight = "0px solid black";
            item.style.margin = "5px 0 5px 5px";
            item.style.borderRadius = "20px 0 0 20px";
            item.querySelector(".username").style.width = "100%";
        });
    }

    function leaveChat() {
        socket.close();
        const boxUsersList = document.querySelector("aside.usersList");
        const boxUsers = boxUsersList.querySelectorAll("div.user");
        messageForm.removeEventListener(
            "submit",
            preventDefaultForEventListener
        );
        boxUsers.forEach((boxUser) => {
            boxUser.removeEventListener("wheel", myWheelForEventDefoult);
        });
        divGeneralChat.style.display = "none";
        startWindow.style.display = null;
        nav.style.display = "none";
        connectToChatForm.querySelector("label input").focus();
        closingUsersList();
    }

    function connectToServer() {
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () => {
            const messageData = {
                type: "join",
                message: yourData,
            };
            socket.send(JSON.stringify(messageData));
            console.log("Соединение WebSocket установлено");
        };

        socket.onmessage = (messageData) => {
            const boxUsersList = document.querySelector("aside.usersList");
            const { type, message } = JSON.parse(messageData.data);
            console.log(message);
            if (type === "join") {
                const notice = document.createElement("div");
                notice.className = "notice";
                notice.innerHTML = `
                    <span class="username">${message.username}</span>
                    <span> joined the chat</span>`;
                chatWindow.appendChild(notice);
            }
            if (type === "assignID") {
                yourData.id = message;
            }
            if (type === "usersList") {
                const innerHTML = message.reduce((acc, item) => {
                    return (
                        acc +
                        `
                    <div class="user" id="n${item.id}">
                        <div class="username">
                            <p>
                                ${item.username}
                            </p>
                            <div id="scroll" style="display: none">
                            <div id="scrollThumb"></div>
                        </div>
                    </div>
                </div>`
                    );
                }, "<h2>List of connected users</h2>");
                boxUsersList.innerHTML = innerHTML;
            }
            if (type === "leave") {
                const notice = document.createElement("div");
                notice.className = "notice";
                notice.innerHTML = `
                    <span class="username">${message.username}</span>
                    <span> left the chat</span>`;
                chatWindow.appendChild(notice);
            }
        };

        socket.onclose = () => {
            const notice = document.createElement("div");
            notice.className = "notice";
            notice.innerHTML = `
                    <span class="username">${yourData.username}</span>
                    <span> left the chat</span>`;
            chatWindow.appendChild(notice);
            document.querySelector(`div.user#n${yourData.id}`).remove();
            console.log("Соединение WebSocket разорвано");
        };

        socket.onerror = (error) => {
            console.error("Ошибка WebSocket:", error);
        };

        return socket;
    }

    function myWheelForEventDefoult(e) {
        function myWheel(e, boxUser) {
            async function moveScroll() {
                if (e.deltaY > 0) {
                    for (let i = 0; i < e.deltaY; i += 3) {
                        boxUser.querySelector("p").scrollLeft += 3;
                        await new Promise((resolve) => setTimeout(resolve, 1));
                    }
                }
                if (e.deltaY < 0) {
                    for (let i = 0; i > e.deltaY; i -= 3) {
                        boxUser.querySelector("p").scrollLeft -= 3;
                        await new Promise((resolve) => setTimeout(resolve, 1));
                    }
                }
            }
            moveScroll();
        }
        myWheel(e, e.currentTarget);
    }
    function preventDefaultForEventListener(e) {
        e.preventDefault();
    }
}
usernameEnter.focus();

formConnectToWebsocket.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(+usernameEnter.value == 0)) {
        const username = usernameEnter.value;
        joinChat(username);
    } else {
        usernameEnter.animate(
            [
                { transform: "translate(0)" },
                { transform: "translate(9px)" },
                { transform: "translate(-9px)" },
                { transform: "translate(6px)" },
                { transform: "translate(-3px)" },
                { transform: "translate(0px)" },
            ],
            350
        );
    }
});

function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
