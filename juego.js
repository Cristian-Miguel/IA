// mods by Patrick OReilly 
// Twitter: @pato_reilly Web: http://patricko.byethost9.com

var w=800;
var h=600;
var menu;
var cursors, speed;
var ball1, ball2, ball3, ball4, jugador, fondo;
var modoAuto = false, eCompleto = false;
var nnEntrenamiento, myNetwork, nnSalida, datosEntrenamiento = [];


var game = new Phaser.Game(w, h, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

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
    ball1 = game.add.sprite(80, 500, 'ball');
    ball2 = game.add.sprite(700, 500, 'ball');
    ball4 = game.add.sprite(700, 0, 'ball');

    knocker = game.add.sprite(400, 200, 'dude');

    game.input.onDown.add(mPausa, self);
    game.physics.enable([knocker,ball1,ball2,ball3, ball4], Phaser.Physics.ARCADE);

    knocker.body.immovable = true;

    ball1.body.velocity.setTo(200, 200);
    ball2.body.velocity.setTo(200, 200);
    ball3.body.velocity.setTo(200, 200);
    ball4.body.velocity.setTo(200, 200);

    knocker.body.collideWorldBounds = true;
    ball1.body.collideWorldBounds = true;
    ball2.body.collideWorldBounds = true;
    ball3.body.collideWorldBounds = true;
    ball4.body.collideWorldBounds = true;

    ball1.body.bounce.setTo(1, 1);
    ball2.body.bounce.setTo(1, 1);
    ball3.body.bounce.setTo(1, 1);
    ball4.body.bounce.setTo(1, 1);

    var pausaL = game.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);

    // myNetwork =  new synaptic.Architect.LSTM(5, 5, 3, 4);
    // var input = 5;
    // var pool = 20;
    // var output = 4;
    // var connections = 30;
    // var gates = 10;

    // myNetwork = new Architect.Liquid(input, pool, output, connections, gates);

    myNetwork =  new synaptic.Architect.Perceptron(5, 5, 4, 4);
    nnEntrenamiento = new synaptic.Trainer(myNetwork);
}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0008, iterations: 1000, shuffle: true});
}

function datosDeEntrenamiento(param_entrada){
    nnSalida = myNetwork.activate(param_entrada);

    // var ejex = nnSalida[0], ejey = nnSalida[1];
    // console.log("Valor salida = "+nnSalida.length," ejey %: "+ejey+" ejex %: "+ejex);
    // var movimiento = [ false, false, false, false ]; 
    //      if( ejey < 0 ){ movimiento = [  true, false, false, false ]; }//arriba
    // else if( ejey > 0 ){ movimiento = [ false,  true, false, false ]; }//abajo
    // else if( ejex > 0 ){ movimiento = [ false, false,  true, false ]; }//izquierda
    // else if( ejex < 0 ){ movimiento = [ false, false, false,  true ]; }//derecha
    // else movimiento = [ false, false, false, false ]; 
 
    // var izquierda = Math.round( nnSalida[0]*100 ),
    //       derecha = Math.round( nnSalida[1]*100 ),  
    //        arriba = Math.round( nnSalida[2]*100 ), 
    //         abajo = Math.round( nnSalida[3]*100 ); 
            //.toFixed(2)

    var izquierda = nnSalida[0]*100, derecha = nnSalida[1]*100,  
           arriba = nnSalida[2]*100,   abajo = nnSalida[3]*100;
                   
    izquierda = izquierda.toFixed(2), derecha = derecha.toFixed(2),  
       arriba = arriba.toFixed(2),      abajo = abajo.toFixed(2); 

    console.log("Valor salida = "+nnSalida.length," izquierda %: "+izquierda+" derecha %: "+derecha+" arriba %: "+arriba+" abajo %: "+abajo);

    var movimiento = [ false, false, false, false ]; 
         if( derecha>izquierda && derecha>arriba   && derecha>abajo   ){ movimiento = [  true, false, false, false ]; }
    else if( izquierda>derecha && izquierda>arriba && izquierda>abajo ){ movimiento = [ false,  true, false, false ]; }
    else if( arriba>izquierda  && arriba>derecha   && arriba>abajo    ){ movimiento = [ false, false,  true, false ]; }
    else if( abajo>izquierda   && abajo>arriba     && abajo>derecha   ){ movimiento = [ false, false, false,  true ]; }
    
    return movimiento;
}

function pausa(){

    // perceptron datos 919   - 5, 3, 1, 4   1000 epocas otro dataset
    // perceptron datos 1608  - 5, 5, 4      1000 epocas otro dataset
    // Perceptron datos 363   - 5, 6, 4     10000 epocas otro dataset
    // Perceptron datos 873   - 5, 7, 4     10000 epocas otro dataset
    // Perceptron datos 1991  - 5, 10, 5, 4  9000 epocas otro dataset
    // Perceptron datos  864  - 5, 10, 6, 4  9000 epocas otro dataset
    // Perceptron datos  833  - 5, 10, 7, 4  9000 epocas persigue a las pelotas otro dataset
    // Perceptron datos  853  - 5, 6, 4      5000 epocas actual
    // Perceptron datos  853  - 5, 5, 2, 4   2000 epocas actual
    // Perceptron datos  760  - 5, 5, 4, 4   1000 epocas rate: 0.0007 actual
    console.log("5, 5, 4, 4 - 1000 perceptron ds");
    game.paused = true;
    menu = game.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(game.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x ,
            mouse_y = event.y ;

        if( (mouse_x > menu_x1 && mouse_x < menu_x2) && (mouse_y > menu_y1 && mouse_y < menu_y2) ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                // console.log("manual");
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                // console.log("auto");
                if(!eCompleto) {
                    console.log("","Entrenamiento - "+ datosEntrenamiento.length +" valores" );
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
    ball2.position.y = 500;
    
    ball3.position.x = 700;
    ball3.position.y = 500;

    ball4.position.x = 700;
    ball4.position.y = 0;

    ball1.body.velocity.setTo(200, 200);
    ball2.body.velocity.setTo(200, 200);
    ball3.body.velocity.setTo(200, 200);
    ball4.body.velocity.setTo(200, 200);

    knocker.position.x = 400;
    knocker.position.y = 200;
}

function colisionH(){
    pausa();
}

//  Move the knocker with the arrow keys
function update () {
    game.physics.arcade.collide(knocker, ball1, colisionH, null, this);
    game.physics.arcade.collide(knocker, ball2, colisionH, null, this);
    game.physics.arcade.collide(knocker, ball3, colisionH, null, this);
    game.physics.arcade.collide(knocker, ball4, colisionH, null, this);
    game.physics.arcade.collide(ball1, ball2);
    game.physics.arcade.collide(ball1, ball3);
    game.physics.arcade.collide(ball1, ball4);
    game.physics.arcade.collide(ball2, ball3);
    game.physics.arcade.collide(ball2, ball4);
    game.physics.arcade.collide(ball3, ball4);

    var despBall1x = Math.pow( Math.floor( knocker.position.x - ball1.position.x ), 2 ),
        despBall2x = Math.pow( Math.floor( knocker.position.x - ball2.position.x ), 2 ),
        despBall3x = Math.pow( Math.floor( knocker.position.x - ball3.position.x ), 2 ),
        despBall4x = Math.pow( Math.floor( knocker.position.x - ball4.position.x ), 2 );

    var despBall1y = Math.pow( Math.floor( knocker.position.y - ball1.position.y ), 2 ),
        despBall2y = Math.pow( Math.floor( knocker.position.y - ball2.position.y ), 2 ),
        despBall3y = Math.pow( Math.floor( knocker.position.y - ball3.position.y ), 2 ),
        despBall4y = Math.pow( Math.floor( knocker.position.y - ball4.position.y ), 2 );

    var distanciaBall1 = Math.pow((despBall1x + despBall1y), (1/2)),
        distanciaBall2 = Math.pow((despBall2x + despBall2y), (1/2)),
        distanciaBall3 = Math.pow((despBall3x + despBall3y), (1/2));
        distanciaBall4 = Math.pow((despBall4x + despBall4y), (1/2));

    if( modoAuto ) {
        var peligro = 0;
        if ( distanciaBall1 <= 200 ) peligro++; 
        if ( distanciaBall2 <= 200 ) peligro++; 
        if ( distanciaBall3 <= 200 ) peligro++;
        if ( distanciaBall4 <= 200 ) peligro++;  

        var movimiento = datosDeEntrenamiento([ Math.round(distanciaBall1), Math.round(distanciaBall2), Math.round(distanciaBall3), Math.round(distanciaBall4), peligro ]);    

        if      ( movimiento[3] ) knocker.body.velocity.y =  300; // abajo
        else if ( movimiento[2] ) knocker.body.velocity.y = -300; // arriba
        else if ( movimiento[1] ) knocker.body.velocity.x = -300; // izquierda
        else if ( movimiento[0] ) knocker.body.velocity.x =  300; // derecha
        else                      knocker.body.velocity.setTo(0, 0);

    } else {
        var derecha = 0, izquierda = 0, arriba = 0, abajo = 0;// var ejex = 0, ejey = 0; 

        if      (cursors.up.isDown)    { knocker.body.velocity.y = -300;    arriba = 1; } // arriba = 1;
        else if (cursors.down.isDown)  { knocker.body.velocity.y =  300;     abajo = 1; } //abajo = 1;
        else if (cursors.left.isDown)  { knocker.body.velocity.x = -300; izquierda = 1; } //izquierda = 1;
        else if (cursors.right.isDown) { knocker.body.velocity.x =  300;   derecha = 1; } //derecha = 1;
        else                             knocker.body.velocity.setTo(0, 0); 

        //dividir la clase
        var peligro = 0;// var claseBall1 = 0, claseBall2 = 0, claseBall3 = 0;
        if ( distanciaBall1 <= 200 ) peligro++; 
        if ( distanciaBall2 <= 200 ) peligro++; 
        if ( distanciaBall3 <= 200 ) peligro++;
        if ( distanciaBall4 <= 200 ) peligro++;  

        // for (let i = 200; i >= 50; i -= 50 ) {
        //     if ( distanciaBall1 <= i ) peligro++; 
        //     if ( distanciaBall2 <= i ) peligro++; 
        //     if ( distanciaBall3 <= i ) peligro++; 
        // }
        // if (distanciaBall1 >= 100 && distanciaBall2 >= 100 && distanciaBall3 >= 100){ } Math.round(knocker.position.x), Math.round(knocker.position.y)'output':  [ arriba, abajo, izquierda, derecha ]

        /* guardar datos */
        datosEntrenamiento.push({
            'input' :  [ Math.round(distanciaBall1), Math.round(distanciaBall2), Math.round(distanciaBall3), Math.round(distanciaBall4), peligro ],
            'output':  [ arriba, abajo, izquierda, derecha ]
        });

        console.log(peligro+", "+Math.round(distanciaBall1)+", "+Math.round(distanciaBall2)+", "+Math.round(distanciaBall3)+", "+Math.round(distanciaBall4)+" <--> "+arriba+", "+abajo+", "+izquierda+", "+derecha);

        // console.log(Math.round(distanciaBall1)+", "+Math.round(distanciaBall2)+", "+Math.round(distanciaBall3)+", "+Math.round(knocker.position.x)+", "+Math.round(knocker.position.y));

        // datosEntrenamiento.push({
        //     'input' :  [ Math.round(distanciaBall1), Math.round(distanciaBall2), Math.round(distanciaBall3), Math.round(knocker.position.x), Math.round(knocker.position.y), ],
        //     'output':  [ izquierda, derecha, arriba, abajo ]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [ Math.round(knocker.position.x), Math.round(knocker.position.y), Math.round(distanciaBall1) ],
        //     'output':  [ izquierda, derecha, arriba, abajo ]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [ Math.round(knocker.position.x), Math.round(knocker.position.y), Math.round(distanciaBall2) ],
        //     'output':  [ izquierda, derecha, arriba, abajo ]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [ Math.round(knocker.position.x), Math.round(knocker.position.y), Math.round(distanciaBall3) ],
        //     'output':  [ izquierda, derecha, arriba, abajo ]
        // });


        // datosEntrenamiento.push({
        //     'input' :  [Math.round(distanciaBall1), claseBall1],
        //     'output':  [izquierda, derecha, arriba, abajo]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [Math.round(distanciaBall2), claseBall2],
        //     'output':  [izquierda, derecha, arriba, abajo]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [Math.round(distanciaBall3), claseBall3],
        //     'output':  [izquierda, derecha, arriba, abajo]
        // });

        // datosEntrenamiento.push({
        //     'input' :  [distanciaBall1, claseBall1, distanciaBall2, claseBall2, distanciaBall3, claseBall3],
        //     'output':  [izquierda, derecha, arriba, abajo]
        // });

        
        // console.log(Math.round(ball2.position.x)+", "+Math.round(ball2.position.y)+", "+Math.round(distanciaBall2)+", "+claseBall2);
        // console.log(Math.round(ball3.position.x)+", "+Math.round(ball3.position.y)+", "+Math.round(distanciaBall3)+", "+claseBall3);

        // console.log(Math.round(ball1.position.x)+", "+Math.round(ball1.position.y)+", "+Math.round(distanciaBall1)+", "+claseBall1);
        // console.log(Math.round(ball2.position.x)+", "+Math.round(ball2.position.y)+", "+Math.round(distanciaBall2)+", "+claseBall2);
        // console.log(Math.round(ball3.position.x)+", "+Math.round(ball3.position.y)+", "+Math.round(distanciaBall3)+", "+claseBall3);

        // console.log(Math.round(distanciaBall1)+", "+claseBall1);
        // console.log(Math.round(distanciaBall2)+", "+claseBall2);
        // console.log(Math.round(distanciaBall3)+", "+claseBall3);

    }
    
}

function render () {

    //debug helper
    // game.debug.body(knocker);
    // game.debug.spriteInfo(ball1, 12, 32);
    // game.debug.spriteInfo(ball2, 12, 128);
    // game.debug.spriteInfo(ball3, 12, 224);

}

// for (let i = 200; i >= 50; i -= 50 ) {
        //     if ( distanciaBall1 <= i ) peligro++; 
        //     if ( distanciaBall2 <= i ) peligro++; 
        //     if ( distanciaBall3 <= i ) peligro++; 
        // }
        // if ( movimiento[1] )      knocker.body.velocity.y =  300; // abajo
        // else if ( movimiento[0] ) knocker.body.velocity.y = -300; // arriba
        // else if ( movimiento[2] ) knocker.body.velocity.x = -300; // izquierda
        // else if ( movimiento[3] ) knocker.body.velocity.x =  300; // derecha
        // else knocker.body.velocity.setTo(0, 0);
        // var claseBall1 = 0, claseBall2 = 0, claseBall3 = 0; 
        // Math.round(knocker.position.x), Math.round(knocker.position.y)    