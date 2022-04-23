/* paso 1: abrir la consola gitbash y dirigirme a la carpeta master jwt-example-desafioLatam */
/* paso 2: reconstruir la carpeta node module utilizando gitbash y el comando: npm install (se creara la carpeta node_modules) */
/* paso 3: levanto la configuración del archivo index.js para que active el puerto escribiendo el comando: node index.js */
/* paso 4: en la consola de gitbash corto la ejecución del comando anterior con ctrl + c */
/* paso 5: levanto los servicios de nodemon, para ello debo escribir el comando: npm run watch */
/* paso 6: abro cualquier navegador y voy a la url http://localhost:3000/covid19/ */
/* paso 7: comienzo a programar */


//función para conectarse a la API y traer toda la información de los países.
const obtenerTodosLosPaises = async () => {
    try {
        const respuesta = await fetch('http://localhost:3000/api/total');

        const { data } = await respuesta.json();

        /* SI "data" es diferente de null o undefined, se enviaran el valor de "data" a las funciones declaradas. */
        /* SINO se cumple la condición, se imprime un mensaje de error. */
        if (data) {
            filtrarMasDeCienMil(data);
            construirTabla(data);
        } else {
            console.log('Error al obtener los datos desde la API.');
        }

    } catch (error) {
        console.error(error);
    }
}

//función para filtrar todos los países y devolver quienes cumplan la regla
const filtrarMasDeCienMil = async (data) => {
    try {

        /* El método filter() crea un nuevo array "filtrar" con todos los elementos que cumplan la condición establecida. */
        const filtrar = await data.filter( elemento => elemento.deaths >= 100000);

        /* SI "filtrar" es diferente de null o undefined, enviaran el valor de data a las funciones declaradas. */
        if (filtrar) {
            construirGrafico(filtrar);
        } else {
            console.log('Error al intentar filtrar la información.');
        }

    } catch (error) {
        console.error(error);
    }
}

//función para construir el grafico de barras
const construirGrafico = (data) => {

    /* creo arreglos vacíos para cada una de las categorías de covid que tendrá cada país. */
    const arregloActivos= [];
    const arregloConfirmados = [];
    const arregloMuertos = [];
    const arregloRecuperados = [];

    /* creo un ciclo for of para recorrer y agregar la "data" y luego que se suba a su arreglo correspondiente. */
    for (graficar of data){
        arregloActivos.push({
            label: graficar.location,
            y: graficar.active,
        });
        arregloConfirmados.push({
            label: graficar.location,
            y: graficar.confirmed,
        });
        arregloMuertos.push({
            label: graficar.location,
            y: graficar.deaths,
        });
        arregloRecuperados.push({
            label: graficar.location,
            y: graficar.recovered,
        });
    }

    /* formato del grafico según canvas.js */
    var chart = new CanvasJS.Chart("contenedorGrafico", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "Paises con Covid19",
            padding: 10,
        },
        axisY: {
            title: ""
        },
        legend: {
            verticalAlign: "top",
            fontSize: 14,
            padding: 100,
        },
        data: [{        
            type: "column",  
            showInLegend: true,
            color: "tomato",
            legendMarkerColor: "tomato",
            legendText: "Casos activos",
            dataPoints: arregloActivos,
        },{        
            type: "column",  
            showInLegend: true,
            color: "gold",
            legendMarkerColor: "gold",
            legendText: "Casos confirmados",
            dataPoints: arregloConfirmados,
        },
        {
            type: "column",  
            showInLegend: true,
            color: "grey",
            legendMarkerColor: "grey",
            legendText: "Casos muertos",
            dataPoints: arregloMuertos,
        },
        {
            type: "column",  
            showInLegend: true,
            color: "turquoise",
            legendMarkerColor: "turquoise",
            legendText: "Casos recuperados",
            dataPoints: arregloRecuperados,
        }],
    });
    chart.render();

}

//función para crear la tabla que ira bajo el grafico.
const construirTabla = (data) => {

    /* creo la estructura de la tabla utilizando las clases de bootstrap 4. */
    document.getElementById('contenedorTabla').innerHTML +=
    `
        <hr>
        <h2 class="text-center py-3">
            Tabla de casos COVID 19 a nivel mundial.
        </h2>
        
        <table class="table table-bordered table-responsive-sm table-striped">
            <thead class="thead-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col" class="text-center">Pais</th>
                    <th scope="col" class="text-center">Confirmados</th>
                    <th scope="col" class="text-center">Muertos</th>
                    <th scope="col" class="text-center">Detalles</th>
                </tr>
            </thead>
            <tbody id="datosTabla">

            </tbody>
        </table>
    `;
    
    /* utilizo la variable "data" como un arreglo que recibo desde obtenerTodosLosPaises()  */
    /* el método forEach() ejecuta la función indicada una vez por cada elemento del array. */
    data.forEach((elemento, index) => {
        document.getElementById('datosTabla').innerHTML += 
        `
            <tr>
                <th scope="row">${index + 1}</th>
                <td class="">${elemento.location}</td>
                <td class="text-right">${elemento.confirmed}</td>
                <td class="text-right">${elemento.deaths}</td>
                <td class="text-center">
                    <button type="button" class='btn btn-outline-info btn-sm' onClick='mostrarModal("${elemento.location}")'>
                        Ver detalle
                    </button>
                </td>
            </tr>
        `;
    });

}

//metodo para levantar el modal desde la tabla
window.mostrarModal = async (pais) => {
/* El objeto window representa la ventana del navegador.  */
/* Todos los objetos, funciones y variables globales de JavaScript se convierten automáticamente en miembros del objeto de ventana */

    /* utilizo las instrucciones de bootstrap de como declarar e iniciar un modal en javascript. */
    /* este codigo debe ir al inicio del evento, si lo coloco al final el grafico se sale del modal al imprimirse. */
    let myModal = new bootstrap.Modal(document.getElementById('detalle-modal'))
    myModal.toggle()

    /* endpoint para seleccionar solo al "pais" que venga como parametro. */
    const respuesta = await fetch(`http://localhost:3000/api/countries/${pais}`);

    const { data } = await respuesta.json();

    /* creo dos arreglos vacios para pasarle solo 1 data de confirmed y deaths por el mismo location. */
    let confirmados = [{ label: data.location, y: data.confirmed }];
    let fallecidos = [{ label: data.location, y: data.deaths }];

    var chart = new CanvasJS.Chart("detalleGrafico", {
        animationEnabled: true,
        title: {
            text: `Situación Covid-19 en ${data.location}`,
            padding: 15,
        },
        axisY: {
            title: "Casos confirmados",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
            includeZero: true
        },
        axisY2: {
            title: "Casos fallecidos",
            titleFontColor: "#C0504E",
            lineColor: "#C0504E",
            labelFontColor: "#C0504E",
            tickColor: "#C0504E",
            includeZero: true
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "column",
            name: "Confirmados",
            showInLegend: true,
            yValueFormatString: "#,##0.# Units",
            dataPoints: confirmados
        },
        {
            type: "column",
            name: "Fallecidos",
            axisYType: "secondary",
            showInLegend: true,
            yValueFormatString: "#,##0.# Units",
            dataPoints: fallecidos
        }]
    });
    chart.render();

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

}


//funcion anonima autoejecutable
( () => {

    obtenerTodosLosPaises();

}) ();
