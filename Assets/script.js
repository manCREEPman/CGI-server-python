const pageInformation = {
    rootStyle: getComputedStyle(document.documentElement),
    chosenTitle: '',
    formData: {}
}

function initMusicGenreForm(){
    let htmlStr = "<label>Название жанра<input class=\"input-margin\" type=\"text\" name=\"genre_name\"></label>" +
    "<br>" +
    "<label>Описание жанра<input class=\"input-margin\" type=\"text-area\" name=\"genre_description\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr
}

function initArtistForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" name=\"artist_name\"></label>" +
    "<br>" +
    "<label>Начало карьеры<input class=\"input-margin\" type=\"text\" name=\"start_career_date\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initAlbumForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" name=\"artist_name\"></label>" +
    "<br>" +
    "<label>Название альбома<input class=\"input-margin\" type=\"text\" name=\"album_name\"></label>" +
    "<br>" +
    "<label>Описание альбома<input class=\"input-margin\" type=\"text-area\" name=\"album_desc\"></label>" +
    "<br>" +
    "<label>Дата выпуска<input class=\"input-margin\" type=\"text\" name=\"album_release_date\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initCompositionForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" name=\"artist_name\"></label>" +
    "<br>" +
    "<label>Название альбома<input class=\"input-margin\" type=\"text\" name=\"album_name\"></label>" +
    "<br>" +
    "<label>Название композиции<input class=\"input-margin\" type=\"text\" name=\"composition_name\"></label>" +
    "<br>" +
    "<label>Название жанра<input class=\"input-margin\" type=\"text\" name=\"genre_name\"></label>" +
    "<br>" +
    "<label>Длительность<input class=\"input-margin\" type=\"text\" name=\"composition_duration\"></label>" +
    "<br>" +
    "<label>Текст<input class=\"input-margin\" type=\"text-area\" name=\"composition-text\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function drawForm(){
    let titleNumber = +pageInformation.chosenTitle[3]
    switch(titleNumber){
        case 1:
            initMusicGenreForm()
        break
        case 2:
            initArtistForm()
        break
        case 3:
            initAlbumForm()
        break
        case 4:
            initCompositionForm()
        break
    }
}

async function getQueryByTableName(table_name){
    let response = await fetch(`/cgi-bin/genre_insertion.py?table_name=${table_name}`)
    return response.json()

}

function displayTableData(dataObj){
    if(!dataObj.status.includes('Error')){
        if(dataObj.data.length != 0){
            let table = document.createElement('table')
            table.id = 'selected-table'
            let dataJSON = dataObj.data
            for(let i = 0; i < dataJSON.length; i++){
                let tableRow = document.createElement('tr')
                let rowData = dataJSON[i]
                for(let j = 0; j < rowData.length; j++){
                    let rowCell = document.createElement('th')
                    rowCell.innerHTML = rowData[j]
                    tableRow.append(rowCell)
                }
                table.append(tableRow)
            }
            return table
        }
    }
    return false
}

function drawTable(){
    let titleNumber = +pageInformation.chosenTitle[3]
    let tableContainer = document.getElementById('selected-table-space')
    tableContainer.innerHTML = ''
    let tableName = ''
    switch(titleNumber){
        case 1:
            tableName = 'Music_genre'
        break
        case 2:
            tableName = 'Artist'
        break
        case 3:
            tableName = 'Album'
        break
        case 4:
            tableName = 'Composition'
        break
    }
    getQueryByTableName(tableName).then(
        (jsonData) => {
            let table = displayTableData(jsonData)
            if(table) tableContainer.append(table)
        }
    )
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
    // вызвать инициализацию формы для данных выбранной таблицы
    drawForm()
    drawTable()
}

function pageInit(){
    pageInformation.chosenTitle = 'nav1'
    document.getElementById('nav1').classList.add('table-title-chosen')
    // подключить обработчики событий на каждый заголовок
    for(let i = 1; i <= 4; i++){
        document.getElementById('nav' + i).addEventListener('click', titleClickEvent)
    }
    drawForm()
    drawTable()
    // getQueryByTableName('Artist').then(
    //     (jsonOb) => {
    //         console.log(jsonOb.status)
    //         console.log(jsonOb.data)
    //         console.log(displayTableData(jsonOb))
    //     }
    // )
    
    // тут вызвать get-запрос на отображение данных таблицы "Музыкальный жанр"
}

pageInit()