// mods by Patrick OReilly 
// Twitter: @pato_reilly Web: http://patricko.byethost9.com

var w=800;
var h=400;
var menu;
var cursors, speed;
var ball1, ball2, ball3, jugador, fondo;
var modoAuto = false, eCompleto = false;
var nnEntrenamiento, myNetwork, nnSalida, datosEntrenamiento = [];


var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('dude', 'assets/junks/dude_1.png');
    game.load.image('ball', 'assets/sprites/purple_ball.png');
    game.load.image('menu', 'assets/game/menu.png');
    game.load.image('fondo', 'assets/game/espacio.jpg');
    
}

var image;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();
    
    fondo = game.add.tileSprite(0, 0, w, h, 'fondo');
    ball3 = game.add.sprite(80, 0, 'ball');
    ball1 = game.add.sprite(80, 80, 'ball');
    ball2 = game.add.sprite(700, 80, 'ball');

    knocker = game.add.sprite(400, 200, 'dude');

    game.physics.enable([knocker,ball1,ball2,ball3], Phaser.Physics.ARCADE);

    knocker.body.immovable = true;

    //  This gets it moving
    ball1.body.velocity.setTo(200, 200);
    ball2.body.velocity.setTo(200, 200);
    ball3.body.velocity.setTo(200, 200);

    //  This makes the game world bounce-able
    ball1.body.collideWorldBounds = true;
    ball2.body.collideWorldBounds = true;
    ball3.body.collideWorldBounds = true;

    //  This sets the image bounce energy for the horizontal 
    //  and vertical vectors (as an x,y point). "1" is 100% energy return
    ball1.body.bounce.setTo(1, 1);
    ball2.body.bounce.setTo(1, 1);
    ball3.body.bounce.setTo(1, 1);

    myNetwork =  new synaptic.Architect.LSTM(6, 1, 4);
    nnEntrenamiento = new synaptic.Trainer(myNetwork);

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

    jugador.position.x = 400;
    jugador.position.y = 200;
}

function colisionH(){
    pausa();
}

//  Move the knocker with the arrow keys
function update () {

    game.physics.arcade.collide(knocker, ball1, colisionH, null, this);
    game.physics.arcade.collide(knocker, ball2, colisionH, null, this);
    game.physics.arcade.collide(knocker, ball3, colisionH, null, this);
    game.physics.arcade.collide(ball1, ball2);
    game.physics.arcade.collide(ball1, ball3);
    game.physics.arcade.collide(ball2, ball3);

    var despBall1x = Math.pow( Math.floor( knocker.position.x - ball1.position.x ), 2 ),
        despBall2x = Math.pow( Math.floor( knocker.position.x - ball2.position.x ), 2 ),
        despBall3x = Math.pow( Math.floor( knocker.position.x - ball3.position.x ), 2 );

    var despBall1y = Math.pow( Math.floor( knocker.position.y - ball1.position.y ), 2 ),
        despBall2y = Math.pow( Math.floor( knocker.position.y - ball2.position.y ), 2 ),
        despBall3y = Math.pow( Math.floor( knocker.position.y - ball3.position.y ), 2 );

    var distanciaBall1 = Math.pow((despBall1x + despBall1y), (1/2)),
        distanciaBall2 = Math.pow((despBall1x + despBall1y), (1/2)),
        distanciaBall3 = Math.pow((despBall1x + despBall1y), (1/2));

    if( modoAuto ) {

        var movimiento = datosDeEntrenamiento([despBall1x, despBall1y, despBall2x, despBall2y, despBall3x, despBall3y]);
             if ( movimiento[0] ) knocker.body.velocity.y = -300; 
        else if ( movimiento[1] ) knocker.body.velocity.y =  300; 
        else if ( movimiento[2] ) knocker.body.velocity.x = -300; 
        else if ( movimiento[3] ) knocker.body.velocity.x = 300; 
        else knocker.body.velocity.setTo(0, 0);

    } else {
        var derecha = 0, izquierda = 0, arriba = 0, abajo = 0; 

        if (cursors.up.isDown)         { knocker.body.velocity.y = -300;    arriba = 1; } 
        else if (cursors.down.isDown)  { knocker.body.velocity.y =  300;     abajo = 1; }
        else if (cursors.left.isDown)  { knocker.body.velocity.x = -300; izquierda = 1; }
        else if (cursors.right.isDown) { knocker.body.velocity.x =  300;   derecha = 1; } 
        else                           { knocker.body.velocity.setTo(0, 0); }

        //dividir la clase
        var claseBall1 = 0, claseBall2 = 0, claseBall3 = 0;
        if (distanciaBall1 <= 150) claseBall1 = 1;

        else if (distanciaBall1 <= 150) claseBall2 = 1;

        else if (distanciaBall1 <= 150) claseBall3 = 1;

        //guardar datos
        datosEntrenamiento.push({
            'input' :  [distanciaBall1, distanciaBall2, distanciaBall3, claseBall1, claseBall2, claseBall3],
            'output':  [izquierda, derecha, arriba, abajo]
        });

        console.log(Math.round(ball1.position.x)+", "+Math.round(ball1.position.y)+", "+Math.round(distanciaBall1)+", "+claseBall1);
        console.log(Math.round(ball2.position.x)+", "+Math.round(ball2.position.y)+", "+Math.round(distanciaBall2)+", "+claseBall2);
        console.log(Math.round(ball3.position.x)+", "+Math.round(ball3.position.y)+", "+Math.round(distanciaBall3)+", "+claseBall3);

    }
    
}

function render () {

    //debug helper
    // game.debug.spriteInfo(ball1, 12, 32);
    // game.debug.spriteInfo(ball2, 12, 128);
    // game.debug.spriteInfo(ball3, 12, 224);

}