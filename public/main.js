// function n(num) {
//     this.eleven = 11;
//     this.num = Number(num);
//     setInterval( () => {
//     	this.num += this.eleven;
//     	console.log(this.num);
//     }, 1000);
// }

// var f1 = new n(9);
// var f2 = new n(4);
// // console.log(n.numbers(10));

let SORT = "";

const taskSort = () => {
  let rowCollection = document.querySelectorAll(".table_body .row");
  let arr = [];
  rowCollection.forEach((row) => {
    arr.push(row);
  });
  if (SORT !== "") {
    arr.sort(function (a, b) {
      let value1 = a.querySelector("." + SORT).firstChild.textContent;
      let value2 = b.querySelector("." + SORT).firstChild.textContent;
      if (value1 > value2) {
        return 1;
      }
      if (value1 < value2) {
        return -1;
      }
      // a должно быть равным b
      return 0;
    });
  }
  clearRows();
  arr.forEach((row) => {
    document.querySelector(".table_body").append(row);
  });
};

const taskSortInit = () => {
  let buttons = document.querySelectorAll(".table_header .arrow");
  buttons.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      let nameArrow = e.currentTarget.parentElement.className;
      if (SORT == "" || SORT != nameArrow) {
        SORT = nameArrow;
      } else if (SORT == nameArrow) {
        SORT = "";
      }
      console.log(SORT);
      taskSort();
    });
  });
};
let ROLE = "";
let taskFilterInit = (defaultStatus) => {
  if (defaultStatus) {
    document.querySelectorAll(".row").forEach((row) => {
      row.style.display = "none";
    });
    document
      .querySelectorAll(".row [data-status='" + defaultStatus + "']")
      .forEach((div) => {
        console.log(div.parentElement);
        div.parentElement.style.display = "flex";
      });
  }

  document.querySelectorAll(".categories_tabs li").forEach((li) => {
    console.log(li);
    li.addEventListener("click", (e) => {
      //находим все li и снимаем класс актив
      li.parentElement.querySelectorAll("li").forEach((li2) => {
        li2.classList.remove("active");
      });
      console.log(e.currentTarget);
      let elem = e.currentTarget;
      elem.classList.add("active");
      console.log(elem.dataset.status);
      let statusName = elem.dataset.status;
      if (statusName == "") {
        document.querySelectorAll(".row").forEach((row) => {
          row.style.display = "flex";
        });
      } else {
        document.querySelectorAll(".row").forEach((row) => {
          row.style.display = "none";
        });
        document
          .querySelectorAll(".row [data-status='" + statusName + "']")
          .forEach((div) => {
            console.log(div.parentElement);
            div.parentElement.style.display = "flex";
          });
      }
      //фильтрация
    });
  });
};
const STATUS_TITLES = {
  new: "Новая",
  progress: "Выполняется",
  sentToConfirm: "Проверяется",
  confirmed: "Подтверждена",
  taskOnClock: "Запрос на вывод часов",
  paid: "Закрыта",
};
const STATUS_BUTTON_ACTIONS = {
  new: "Вернуть на доработку",
  progress: "Приступить к задаче",
  sentToConfirm: "Отправить на подтверждение",
  confirmed: "Подтвердить",
  taskOnClock: "Запрос на вывод часов",
  paid: "Закрыть задачу",
};
function myFuncClick(event) {
  console.log("Клик мыши", event.target);
  let elem = event.target;
  elem.style.background = "green";
}

function changeStatus(id, status) {
  console.log("Задача  айди " + id + " подтверждена");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/tasks/edit");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  let data = {
    status: status,
    _id: id,
  };
  let jsonData = JSON.stringify(data);
  xhr.send(jsonData);

  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(xhr.status, xhr.statusText);
    } else {
      let result = JSON.parse(xhr.response);
      requestTasks();
    }
  };
}
function myFuncHover() {
  console.log("На элемент наведен курсор мыши");
}
const nextStatus = (currentStatus) => {
  let nStatus;
  let statuses = [
    "new",
    "progress",
    "sentToConfirm",
    "confirmed",
    "taskOnClock",
    "paid",
  ];
  for (let i = 0; i < statuses.length; i++) {
    if (currentStatus == statuses[i]) {
      nStatus = statuses[i + 1];
    }
  }
  if (nStatus == undefined) {
    nStatus = statuses[statuses.length - 1];
  }
  return nStatus;
};
function createRow(data) {
  console.log(data[0], "ДАТА");
  for (let task of data) {
    let row = document.createElement("div");
    row.className = "row";
    row.dataset.task = task._id;

    let checkbox = document.createElement("div");
    checkbox.className = "checkbox";
    checkbox.innerHTML =
      '<input type="checkbox" class="custom-checkbox" id="' +
      task._id +
      '" name="' +
      task._id +
      '">';
    checkbox.innerHTML += '<label for="' + task._id + '"></label>';
    row.append(checkbox);

    let status = document.createElement("div");
    status.className = "status";
    status.innerHTML = "<div>" + STATUS_TITLES[task.status] + "</div>";
    status.dataset.status = task.status;
    row.append(status);

    let clock = document.createElement("div");
    clock.className = "clock";
    clock.innerHTML = "<div>" + task.hours + "</div>";
    row.append(clock);

    let description = document.createElement("div");
    description.className = "task_description";
    description.innerHTML = "<div>" + task.description + "</div>";
    row.append(description);

    let div_action = document.createElement("div");
    div_action.className = "action";
    row.append(div_action);

    if (ROLE === "reviewer") {
      let btn_back = document.createElement("div");
      btn_back.className = "btn btn_primery";
      btn_back.innerHTML = "На доработку";
      div_action.append(btn_back);
      btn_back.addEventListener("click", (e) => {
        let row = e.currentTarget.parentElement.parentElement;
        let id, status;
        id = row.dataset.task;
        status = "new";
        changeStatus(id, status);
      });
    }

    let btn_primery = document.createElement("div");
    btn_primery.className = "btn btn_primery";
    btn_primery.innerHTML = STATUS_BUTTON_ACTIONS[nextStatus(task.status)];
    if (task.status != "paid") {
      div_action.append(btn_primery);
    }

    let table_body = document.querySelector(".table_body");
    table_body.append(row);

    btn_primery.addEventListener("click", (e) => {
      let event = e;

      let row = e.currentTarget.parentElement.parentElement;
      console.log(row.dataset.task);

      let id, status;
      id = row.dataset.task;
      status = nextStatus(task.status);
      changeStatus(id, status);
    });
    let changeCellData = (e) => {
      let targetElem = e.currentTarget;
      let targetClassName = targetElem.className;
      let id = targetElem.parentElement.dataset.task;
      if (targetElem.classList.contains("editing")) {
        return;
      }
      targetElem.classList.add("editing");
      if (targetClassName != "status") {
        let input = document.createElement("input");
        input.type = "text";
        targetElem.append(input);
        input.addEventListener("blur", () => {
          targetElem.classList.remove("editing");
          let newValue = input.value;
          input.remove();
          targetElem.children[0].innerHTML = newValue;
          //save данных введенех в инпут
          let xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/tasks/edit");
          xhr.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8"
          );
          let data = {
            _id: id,
          };
          if (targetElem.classList.contains("clock")) {
            data.hours = newValue;
          }
          if (targetElem.classList.contains("task_description")) {
            data.description = newValue;
          }
          let jsonData = JSON.stringify(data);
          xhr.send(jsonData);

          xhr.onload = function () {
            if (xhr.status != 200) {
              console.log(xhr.status, xhr.statusText);
            } else {
              let result = JSON.parse(xhr.response);
              requestTasks();
            }
          };
        });
      } else {
        let select = document.createElement("select");
        select.innerHTML = `
            <option value="new">${STATUS_TITLES["new"]}</option>
            <option value="progress">${STATUS_TITLES["progress"]}</option>
            <option value="sentToConfirm">${STATUS_TITLES["sentToConfirm"]}</option>
            <option value="confirmed">${STATUS_TITLES["confirmed"]}</option>
            <option value="taskOnClock">${STATUS_TITLES["taskOnClock"]}</option>
            <option value="paid">${STATUS_TITLES["paid"]}</option>
        `;
        targetElem.append(select);
        select.addEventListener("change", () => {
          targetElem.classList.remove("editing");
          let newValue = select.options[select.selectedIndex].text;
          select.remove();
          targetElem.children[0].innerHTML = newValue;
          //save данных селект на сервер
          let xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/tasks/edit");
          xhr.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8"
          );
          let data = {
            _id: id,
            status: select.value,
          };
          let jsonData = JSON.stringify(data);
          xhr.send(jsonData);

          xhr.onload = function () {
            if (xhr.status != 200) {
              console.log(xhr.status, xhr.statusText);
            } else {
              let result = JSON.parse(xhr.response);
              requestTasks();
            }
          };
        });
      }
    };
    status.addEventListener("click", changeCellData);
    clock.addEventListener("click", changeCellData);
    description.addEventListener("click", changeCellData);
    // btn_primery.addEventListener('click', changeStatus);
  }
}

function clearRows() {
  let table_body = document.querySelector(".table_body");
  table_body.innerHTML = "";
}

function createNewTask() {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/tasks/add");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  let data = {
    status: "new",
    hours: "4",
    description: "Do 4",
  };
  let jsonData = JSON.stringify(data);
  xhr.send(jsonData);

  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(xhr.status, xhr.statusText);
    } else {
      let result = JSON.parse(xhr.response);
      result = [result];
      console.log(JSON.parse(xhr.response));
      createRow(result);
    }
  };
}

// let fn = (fnAfterCounting) => {
//   let t = 2;
//   for (i=0;i<50000;i++) {
//     t+=2;
//   }
//   fnAfterCounting(t)
//   //console.log("страница загружена")
// }

// let consoleCb = (t) => {
//   console.log("Я вызвал эту функцию из консоли, t =" + t)
// }

// let initCb = (t) => {
//   console.log("Я вызвал эту функцию из консоли, t =" + (t + 90))
// }

// let myFunc1 = initCb;

// fn();
//fn(Я вызвал эту функцию из консоли, t = ...)

function requestTasks(callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/api/tasks");

  // 1. Создаём новый XMLHttpRequest-объект
  // 2. Настраиваем его: GET-запрос по URL /article/.../load
  // xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

  // 3. Отсылаем запрос
  xhr.send();

  // 4. Этот код сработает после того, как мы получим ответ сервера
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(xhr.status, xhr.statusText);
    } else {
      const data = JSON.parse(xhr.response);
      clearRows();
      console.log(data);
      createRow(data);
      if (SORT != "") {
        taskSort();
      }

      if (ROLE === "customer") {
        let counter = 0;

        data.forEach((item) => {
          counter += item.hours;
        });

        let str = "Всего: " + counter + " часов | " + counter * 80 + " рублей";
        console.log(str);

        document.querySelector(".top_bar .info_work").innerText = str;
      }

      if (callback) {
        callback(data);
      }
    }
  };

  xhr.onerror = function () {
    console.log("Запрос не удался");
  };
}
document.addEventListener("DOMContentLoaded", () => {

  if (document.body.className === "login") return;

  taskSortInit();
  ROLE = document.body.className;

  let cb = (data) => {
    if (ROLE === "reviewer") {
      taskFilterInit("progress");
    } else {
      taskFilterInit();
    }
  };

  requestTasks(cb);
});

// btn menu

// здесь я реализовал функция вывода блока очень просто по сравнению с предыдущей

function btnClick() {
  // document.getElementById("myDropdown").classList.toggle("show");
  let x = document.getElementById("myDropdown");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

// Close the dropdown if the user clicks outside of it
// window.onclick = function (event) {
//   if (!event.target.matches(".dropbtn")) {
//     var dropdowns = document.getElementsByClassName("dropdown-content");
//     for (let i = 0; i < dropdowns.length; i++) {
//       var openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains("show")) {
//         openDropdown.classList.remove("show");
//       }
//     }
//   }
// };