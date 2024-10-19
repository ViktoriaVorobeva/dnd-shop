const products = document.querySelectorAll('.product');
const box = document.querySelector('.products__box')
const backet = document.querySelector('.backet');
const main = document.querySelector('.main');

const COUNT = 4;

let button;
let startY;
let scrollTop;

// создание кнопки
const generateElement = () => {
    const newElement = document.createElement('button');
    newElement.textContent = 'Оплатить корзину'
    newElement.classList.add('button');
    newElement.addEventListener('click', () => window.location.assign('https://lavka.yandex.ru/'));
    main.append(newElement);

    return newElement;
}

// проверка находится ли элемент в корзине
const isElementinContainer = (event, container) => {
    const {
        clientX,
        clientY
    } = event;
    const {
        top,
        left,
        right,
        bottom
    } = container.getBoundingClientRect();
    return clientX < right && clientX > left && clientY > top && clientY < bottom
}

//обработка попытке перетаскивания за пределы страницы
const isOffPage = (element, page) => {
    const {
        style,
        width
    } = element;
    const {
        top,
        left,
        right,
        height
    } = page.getBoundingClientRect();

    const leftEl = +style.left.slice(0, -2);
    const topEl = +style.top.slice(0, -2);

    if (leftEl + width >= right) {
        element.style.left = `${right - element.width}px`;
    }
    if (leftEl <= left) {
        element.style.left = `${left}px`;
    }
    if (topEl <= top) {
        element.style.top = `${top}px`;
    }
    if (topEl + element.height >= height) {
        element.style.top = `${height - element.height}px`;
    }
}

//обработка корректного положения продуктов в корзине
const isBacketBottom = (element) => {
    const left = backet.offsetLeft + backet.getBoundingClientRect().width * 0.25;
    const right = (backet.offsetLeft + backet.getBoundingClientRect().width) * 0.75;
    const leftEl = element.style.left.slice(0, -2);

    if (leftEl < left) {
        element.style.left = `${left}px`;
    }

    if (leftEl > right) {
        element.style.left = `${right}px`;
    }
}

//обработка вертикального скролла
const isScrolling = (event) => {
    const {
        pageY
    } = event;
    return pageY >= window.innerHeight + window.pageYOffset;
}

//перетаскивание
const moveElement = (event, element) => {
    event.preventDefault();

    element.style.left = `${event.pageX - element.width/2}px`;
    element.style.top = `${event.pageY - element.height/2}px`;
    isOffPage(element, document.body)

    if (isScrolling(event)) {
        const y = event.pageY - window.pageYOffset;
        const walkY = y - startY;
        window.scrollBy({
            left: 0,
            top: walkY - scrollTop,
            behavior: "smooth"
        });
    }
}

//обработка drop-события
const pointerUpHandler = (event, element, starts) => {
    event.preventDefault();

    if (isElementinContainer(event, backet)) {
        element.style.top = `${backet.offsetTop + (backet.getBoundingClientRect().height * 0.8) - element.height}px`;
        isBacketBottom(element);
        element.style.zIndex = -1;
        backet.append(element);

        const length = backet.children.length;

        if (length === COUNT + 1) {
            generateElement();

            button = document.querySelector('.button')
            button.scrollIntoView({
                behavior: 'smooth'
            });
        }
    } else {
        const [left, top] = starts;

        document.body.removeChild(element);
        box.appendChild(element);

        element.style.left = left;
        element.style.top = top;
    }
    document.onpointermove = null;
    document.onpointerup = null;
}

//обработка старта
const startHandler = (event) => {
    event.preventDefault();

    startY = event.pageY - window.pageYOffset;
    scrollTop = window.pageYOffset;

    const element = event.target;
    const styles = window.getComputedStyle(element);

    const starts = [styles.left, styles.top];
    const size = [styles.height, styles.width];

    document.body.appendChild(element);

    element.style.height = size[0];
    element.style.width = size[1];

    moveElement(event, element);

    element.ondragstart = function () {
        return false;
    };

    document.onpointermove = (event) => moveElement(event, element);
    document.onpointerup = (event) => pointerUpHandler(event, element, starts);
}

for (const product of products) {
    product.addEventListener('pointerdown', startHandler);
}