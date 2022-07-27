// // var fs = require(['fs']); 
// define(['fs'] );
// var file = require(['node_modules/file-system/file-system.js']);
const {Layer,  Network} = window.synaptic;

//2,2,1 con 2000 epocas y 281-563 datos
var inputLayer = new Layer(2);
var hiddenLayer = new Layer(2);
var outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

var myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD=false, nave;

var salto;
var menu;

var velocidadBala;
var despBala;
var estatusAire;
// var estatuSuelo;

var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 700;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //2,1,2 3500 datos 1000 epocas, --- 2,2,1,1 945 datos con 2000 epocas
    // LSTM 2,1,2,1,2 800 datos 1000 epocas
    // nnNetwork =  new synaptic.Architect.Perceptron(2, 2, 1, 1);
    // nnNetwork =  new synaptic.Architect.LSTM(2, 1, 2, 1, 2);
    // nnEntrenamiento = new synaptic.Trainer(nnNetwork);
    nnEntrenamiento = new synaptic.Trainer(myNetwork);
}

function enRedNeural(){
    // var learningRate = .3;
    // for (var i = 0; i < 20000; i++)
    // {
    //     for (var i = 0; i < datosEntrenamiento.length; i++)
    //     {
    //         myNetwork.activate(datosEntrenamiento[i].input);
    //         myNetwork.propagate(learningRate, datosEntrenamiento[0].output);
    //     }
    // }
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 2000, shuffle: true});
}


function datosDeEntrenamiento(param_entrada){
    // console.log("Entrada",param_entrada[0]+" - "+param_entrada[1]);
    nnSalida = myNetwork.activate(param_entrada);
    
    var aire = Math.round( nnSalida[0]*100 );
    // var piso = Math.round( nnSalida[1]*100 );+" En el suelo %: " + piso
    var salto = aire>=90;
    console.log("Valor ","En el Aire %: "+ aire+ " salto = "+ salto);

    // return nnSalida[0]>=nnSalida[1];
    return salto
}


function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {

                    // fs.writeFile("datos.txt", datosEntrenamiento, (err) => {
                    //     if (err) throw err;
                    //     console.log("Completed!");
                    // });
                    
                    // for(var i = 0; i<datosEntrenamiento.length; i++){
                    //     var fila = datosEntrenamiento[i].input[0]+" "+datosEntrenamiento[i].input[1]+" "+datosEntrenamiento[i].output[0];
                    //     document.write(fila);
                    // }
                    
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;

        }
    }
}


function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala.body.velocity.x = 0;
    bala.position.x = w-100;
    jugador.position.x=50;
    balaD=false;
}


function saltar(){
    // console.log("Salta");
    jugador.body.velocity.y = -270;
}


function update() {

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);

    // estatuSuelo = 1;
    estatusAire = 0;

    if(!jugador.body.onFloor()) {
        // estatuSuelo = 0;
        estatusAire = 1;
    }
	
    despBala = Math.floor( jugador.position.x - bala.position.x );

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }
    
    if( modoAuto == true  && bala.position.x>0 && jugador.body.onFloor()) {

        if( datosDeEntrenamiento( [despBala , velocidadBala] )  ){
            saltar();
        }
    }

    if( balaD==false ){
        disparo();
    }

    if( bala.position.x <= 0  ){
        resetVariables();
    }
    
    if( modoAuto ==false  && bala.position.x > 0 ){

        datosEntrenamiento.push({
                'input' :  [despBala , velocidadBala],
                'output':  [estatusAire]
                
        });
        // 'output':  [estatusAire , estatuSuelo ]  

        // console.log("Desplazamiento Bala, Velocidad Bala, Estatus: ",
        //     despBala + " " +velocidadBala + " "+ estatusAire);
        console.log(despBala + " " +velocidadBala + " "+ estatusAire);
            //, Estatus  +" "+  estatuSuelo
   }

}


function disparo(){
    velocidadBala =  -1 * velocidadRandom(300,800);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
}

function colisionH(){
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}
