const buttonUsersList = document.querySelector("button.usersList");
const boxUsersList = document.querySelector("aside.usersList");
const boxUsers = boxUsersList.querySelectorAll("div.user");
const messageForm = document.querySelector("form.messageForm");
const main = document.querySelector("main");

buttonUsersList.onclick = () => {
    switch (boxUsersList.style.width) {
        case "0px":
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
            break;
        default:
            boxUsersList.style.width = "0px";
            boxUsersList.querySelector("h2").style.borderRadius = "0 0 0 15px";
            boxUsers.forEach((item) => {
                item.style.borderRight = "0px solid black";
                item.style.margin = "5px 0 5px 5px";
                item.style.borderRadius = "20px 0 0 20px";
                item.querySelector(".username").style.width = "100%";
            });
    }
};

boxUsers.forEach((boxUser) => {
    const divScrollThumb = boxUser.querySelector("div#scrollThumb");
    const usernameWidth = boxUser.querySelector("p").scrollWidth;
    const boxUserWidth = boxUser.querySelector("div.username").offsetWidth;
    if (usernameWidth > boxUserWidth) {
        boxUser.querySelector("div#scroll").style.display = null;
        divScrollThumb.style.width = `${(boxUserWidth / usernameWidth) * 100}%`;
        boxUser.addEventListener(
            "wheel",
            (e) => {
                async function moveScroll() {
                    if (e.deltaY > 0) {
                        for (let i = 0; i < e.deltaY; i += 3) {
                            boxUser.querySelector("p").scrollLeft += 3;
                            await new Promise((resolve) =>
                                setTimeout(resolve, 1)
                            );
                        }
                    }
                    if (e.deltaY < 0) {
                        for (let i = 0; i > e.deltaY; i -= 3) {
                            boxUser.querySelector("p").scrollLeft -= 3;
                            await new Promise((resolve) =>
                                setTimeout(resolve, 1)
                            );
                        }
                    }
                }
                moveScroll();
            },
            { passive: true }
        );
        boxUser.querySelector("p").addEventListener("scroll", () => {
            const scrollPosition = boxUser.querySelector("p").scrollLeft;
            divScrollThumb.style.left = `${
                (scrollPosition / usernameWidth) * 100
            }%`;
        });
    }
});

const resizeObserver = new ResizeObserver(() => {
        const divScrollThumb = messageForm.querySelector("div#scrollThumb");
        const usernameHeight =
            messageForm.querySelector("textarea").scrollHeight + 6;
        const boxUserHeight =
            messageForm.querySelector("textarea").offsetHeight;
        if (usernameHeight > boxUserHeight) {
            messageForm.querySelector("div#scroll").style.display = null;
            divScrollThumb.style.height = `${
                (boxUserHeight / usernameHeight) * 100
            }%`;
            messageForm
                .querySelector("textarea")
                .addEventListener("scroll", () => {
                    const scrollPosition =
                        messageForm.querySelector("textarea").scrollTop;
                    divScrollThumb.style.top = `${
                        (scrollPosition / usernameHeight) * 100
                    }%`;
                });
        } else {
            messageForm.querySelector("div#scroll").style.display = "none";
        }
    });
resizeObserver.observe(messageForm);

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
});
