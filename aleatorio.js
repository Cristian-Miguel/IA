const {Layer,  Network} = window.synaptic;

//2,2,1 con 2000 epocas y 281-563 datos
// var inputLayer = new Layer(6);
// var hiddenLayer1 = new Layer(6);
// var hiddenLayer2 = new Layer(6);
// var outputLayer = new Layer(4);

// inputLayer.project(hiddenLayer1);
// hiddenLayer1.project(hiddenLayer2);
// hiddenLayer2.project(outputLayer);

// var myNetwork = new Network({
//     input: inputLayer,
//     hidden: [hiddenLayer1, ],
//     output: outputLayer
// });

var w=800;
var h=400;
var menu;
var cursors, speed;
var ball1, ball2, ball3, jugador, fondo;
var modoAuto = false, eCompleto = false;
var nnEntrenamiento, myNetwork, nnSalida, datosEntrenamiento = [];
var game = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('nave', 'assets/game/caza.png');
    game.load.image('fondo', 'assets/game/espacio.jpg');
    game.load.image('bala', 'assets/sprites/purple_ball.png');
    game.load.image('menu', 'assets/game/menu.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    fondo = game.add.tileSprite(0, 0, w, h, 'fondo');
    ball3 = game.add.sprite(80, 0, 'bala');
    ball1 = game.add.sprite(80, 80, 'bala');
    ball2 = game.add.sprite(700, 80, 'bala');
    jugador = game.add.sprite(350, 200, 'nave');

    game.physics.arcade.enable([ball3, ball1, ball2, jugador]);

    ball1.body.setCircle(8);
    ball2.body.setCircle(8);
    ball3.body.setCircle(8);
    
    jugador.body.collideWorldBounds = true;
    ball1.body.collideWorldBounds = true;
    ball2.body.collideWorldBounds = true;
    ball3.body.collideWorldBounds = true;
 
    ball1.body.bounce.set(1);
    ball2.body.bounce.set(1);
    ball3.body.bounce.set(1);
 
    ball1.body.gravity.y = 100;
    ball2.body.gravity.y = 100;
    ball3.body.gravity.y = 100;
 
    ball1.body.velocity.set(150);
    ball2.body.velocity.set(-200, 60);
    ball3.body.velocity.set(50);

    game.input.onDown.add(mPausa, self);

    myNetwork =  new synaptic.Architect.LSTM(3, 1, 4);
    nnEntrenamiento = new synaptic.Trainer(myNetwork);

    var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.speed = Phaser.Math.GetSpeed(500, 1);
        },

        fire: function (x, y)
        {
            this.setPosition(x, y - 50);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta)
        {
            this.y -= this.speed * delta;

            if (this.y < -50)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });
 
    cursors = this.input.keyboard.createCursorKeys();
    speed = Phaser.Math.GetSpeed(300, 1);
 
 }

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 1000, shuffle: true});
}

function datosDeEntrenamiento(param_entrada){
    nnSalida = myNetwork.activate(param_entrada);
    
    var izquierda = Math.round( nnSalida[0]*100 ),
        derecha = Math.round( nnSalida[1]*100 ),  
        arriba = Math.round( nnSalida[2]*100 ), 
        abajo = Math.round( nnSalida[3]*100 ); 
    console.log("Valor ","izquierda %: "+izquierda+" derecha %: "+derecha+" arriba %: "+arriba+" abajo %: "+abajo);

    var movimiento = [ false, false, false, false ]; 
         if( derecha>izquierda && derecha>arriba   && derecha>abajo   ){ movimiento = [  true, false, false, false ]; }
    else if( izquierda>derecha && izquierda>arriba && izquierda>abajo ){ movimiento = [ false,  true, false, false ]; }
    else if( arriba>izquierda  && arriba>derecha   && arriba>abajo    ){ movimiento = [ false, false,  true, false ]; }
    else if( abajo>izquierda   && abajo>arriba     && abajo>derecha   ){ movimiento = [ false, false, false,  true ]; }
    
    return movimiento;
}

function pausa(){
    game.paused = true;
    menu = game.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(game.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if( (mouse_x > menu_x1 && mouse_x < menu_x2) && (mouse_y > menu_y1 && mouse_y < menu_y2) ){

            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                console.log("manual");
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                console.log("auto");
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            game.paused = false;

        }

    }
}
 
function resetVariables(){
    ball1.position.x = 80;
    ball1.position.y = 0;

    ball2.position.x = 80;
    ball2.position.y = 80;
    
    ball3.position.x = 700;
    ball3.position.y = 80;

    jugador.position.x = 350;
    jugador.position.y = 200;
}

function colisionH(){
    pausa();
}

function update () {

    game.physics.arcade.collide(ball1, jugador, colisionH, null, this);
    game.physics.arcade.collide(ball2, jugador, colisionH, null, this);
    game.physics.arcade.collide(ball3, jugador, colisionH, null, this);
    game.physics.arcade.collide(ball1, ball2);
    game.physics.arcade.collide(ball1, ball3);
    game.physics.arcade.collide(ball2, ball3);

    var despBall1x = Math.pow( Math.floor( jugador.position.x - ball1.position.x ), 2 ),
        despBall2x = Math.pow( Math.floor( jugador.position.x - ball2.position.x ), 2 ),
        despBall3x = Math.pow( Math.floor( jugador.position.x - ball3.position.x ), 2 );

    var despBall1y = Math.pow( Math.floor( jugador.position.y - ball1.position.y ), 2 ),
        despBall2y = Math.pow( Math.floor( jugador.position.y - ball2.position.y ), 2 ),
        despBall3y = Math.pow( Math.floor( jugador.position.y - ball3.position.y ), 2 );

    var distanciaBall1 = Math.pow((despBall1x - despBall1y), (1/2)),
        distanciaBall2 = Math.pow((despBall1x - despBall1y), (1/2)),
        distanciaBall3 = Math.pow((despBall1x - despBall1y), (1/2));

    if( modoAuto == true ) {
        var movimiento = datosDeEntrenamiento([despBall1x, despBall1y, despBall2x, despBall2y, despBall3x, despBall3y]);
             if ( movimiento[0] ){ jugador.x += 5*2; }
        else if ( movimiento[1] ){ jugador.x -= 5*2; }
        else if ( movimiento[2] ){ jugador.y -= 5*2; }
        else if ( movimiento[3] ){ jugador.y += 5*2; }
    }

    if( modoAuto == false) {
        var derecha = 0, izquierda = 0, arriba = 0, abajo = 0; 

        if (cursors.left.isDown)
        {
            // console.log("izq");
            jugador.body.velocity.set(50);
            jugador.x -= speed * 2;
            izquierda = 1;
        }
        else if (cursors.right.isDown)
        {
            // console.log("der");
            jugador.x += speed * 2;
            derecha = 1;
        }
        else if (cursors.up.isDown)
        {
            // console.log("arr");
            jugador.y -= speed * 2;
            arriba = 1;
        }
        else if (cursors.down.isDown)
        {
            // console.log("aba");
            jugador.y += speed * 2;
            abajo = 1;
        }

        cursors.left.isDown = false;
        cursors.right.isDown = false;
        cursors.up.isDown = false;
        cursors.down.isDown = false;

        datosEntrenamiento.push({
            'input' :  [distanciaBall1, distanciaBall2, distanciaBall3],
            'output':  [izquierda, derecha, arriba, abajo]
        });
    
        // console.log(despBall1x+" "+despBall1y+" "+despBall2x+" "+despBall2y+" "+despBall3x+" "+despBall3y+" ",
        //     " "+izquierda+" "+derecha+" "+arriba+" "+abajo);
    }

    // console.log(
    //     "posicion de la bola1: "+despBall1x+" "+despBall1y+" ",
    //     "posicion de la bola2: "+despBall2x+" "+despBall2y+" ",
    //     "posicion de la bola2: "+despBall3x+" "+despBall3y+" ",
    //     "izquierda: "+izquierda+" derecha: "+derecha+" arriba: "+arriba+" abajo: "+abajo);
}
 
function render () {
//     game.debug.body(jugador);
//     game.debug.body(ball3);
//     game.debug.body(ball1);
//     game.debug.body(ball2);
}
