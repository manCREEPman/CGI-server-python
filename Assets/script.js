const pageInformation = {
    rootStyle: getComputedStyle(document.documentElement),
    chosenTitle: '',
    formData: {}
}

async function test(){
    // let response = await fetch('/cgi-bin/genre_insertion.py?table_name=Artist')
    // const data = {
    //     table_name: 'Artist',
    //     columns: [1, '2', 3],
    //     data: ['asdf', 12, 'typ']
    // }
    // let response = await fetch('/cgi-bin/genre_insertion.py',
    // {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(data),
    // })
    // let response = await fetch('/cgi-bin/genre_insertion.py?table_name=Composition')
    // console.log(response)
    // console.log(response.text())
    // console.log(response.status)
    // console.log(response.json)
    let root = document.documentElement
    root.style.setProperty('--title-bg-color', '#727262')
}

function titleClickEvent(event){
    let prevChoose = document.getElementById(pageInformation.chosenTitle)
    prevChoose.classList.remove('table-title-chosen')
    // prevChoose.style.backgroundColor = pageInformation.rootStyle.getPropertyValue('--title-bg-color')
    // prevChoose.style.border = pageInformation.rootStyle.getPropertyValue('--title-border')
    pageInformation.chosenTitle = event.currentTarget.id
    let currentChoose = document.getElementById(pageInformation.chosenTitle)
    currentChoose.classList.add('table-title-chosen')
    // currentChoose.style.backgroundColor = pageInformation.rootStyle.getPropertyValue('--title-bg-color-chosen')
    // currentChoose.style.backgroundColor = pageInformation.rootStyle.getPropertyValue('--title-border-chosen')
    // вызывать get-запрос на отображение данных таблицы
}

function pageInit(){
    pageInformation.chosenTitle = 'nav1'
    // подключить обработчики событий на каждый заголовок
    for(let i = 1; i <= 4; i++){
        document.getElementById('nav' + i).addEventListener('click', titleClickEvent)
    }
    // тут вызвать get-запрос на отображение данных таблицы "Музыкальный жанр"
}

pageInit()