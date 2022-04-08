 
import kaboom from './kaboom/dist/kaboom.mjs';


kaboom({
    global: true,
    // width: 600,
    // height: 300,
    fullscreen: true,
    scale: 2, 
    debug: true,
    background: [0, 0, 0, 1],
});

//sprites, blocks to build world
loadSprite('coin', 'assets/coin.png');
loadSprite('brick', 'assets/brick.png');
loadSprite('block', 'assets/box.png');
loadSprite('mario', 'assets/mario.png');
loadSprite('mushroom', 'assets/mushroom.png');
loadSprite('evil-mushroom', 'assets/evil-mushroom.png');
loadSprite('surprise-box', 'assets/surprise-box.png');
loadSprite('pipe', 'assets/pipe.png');
loadSprite('castle', 'assets/castle.png');


//sounds to play during gameplay
// loadRoot('https://dazzling-vacherin-8cb912.netlify.app/assets/');
// loadRoot('http://localhost:5501/assets/');
// loadSound('jump', 'marioJump.mp3');
// loadSound('theme', 'mainTheme.mp3');

loadSprite('start-screen', './assets/start-screen.png');

scene('start', () => {
    
    const startScreen = add([
        sprite('start-screen'),
        origin('center'), 
        pos(0, 0), 
        scale(0.65)
    ]);
    add([
        text('Press Spacebar To Start'),
        origin('center'), 
        pos(0, 125), 
        scale(0.25)
    ]);

    onKeyDown('space', () => {
        go('game');
    });
    
    startScreen.onUpdate(() => {
        camPos(startScreen.pos.x, (startScreen.pos.y + 50));
    });
});

scene('game', () => {
    layers(['bg', 'obj', 'ui'], 'obj');

    const mario = add([
        sprite('mario'), 
        solid(), 
        area(),
        pos(860, 0),
        body(),
        origin('bot'),
        'mario'
    ]);

    add([
        sprite("castle"),
        pos(1018, 286),
        layer("bg"),
        origin("bot"),
        scale(0.25)
      ])

    //   mario.onCollide("castle", (obj) => {
    //     add([

    // if (mario.pos === (860, 280)) {
    //     add([ text("Well Done!", { size: 24 }),
    //       pos(toWorld(vec2(160, 120))),
    //       color(255, 255, 255),
    //       origin("center"),
    //       layer('ui'),
    //     ])}
    //   console.log(mario.pos);


    const marioSpeed = 120;
    const marioJumpHeight = 600;
    const mushroomMove = 40;
    const evilMushroomMove = 20;


    onKeyDown('left', () => {
        mario.move(-marioSpeed, 0);
    });

    onKeyDown('right', () => {
        mario.move(marioSpeed, 0);
    });

    onKeyPress('space', () => {
        if (mario.isGrounded()) {
            mario.jump(marioJumpHeight);
        }
    });

    mario.onCollide('coin-surprise', (obj) => {
        if (mario.pos.y === obj.pos.y + 40) {
            destroy(obj);
            gameLevel.spawn('*', obj.gridPos.sub(0, 1));
            gameLevel.spawn('+', obj.gridPos.sub(0, 0));
        }
    });

    mario.onCollide('mushroom-surprise', (obj) => {
        if (mario.pos.y === obj.pos.y + 40) {
            destroy(obj);
            gameLevel.spawn('@', obj.gridPos.sub(0, 1));
            gameLevel.spawn('+', obj.gridPos.sub(0, 0));
            onUpdate('mushroom', (obj) => {
                obj.move(mushroomMove, 0);
            });
        }
    });

    mario.onCollide('brick', (obj) => {
        if (mario.pos.y === obj.pos.y + 40) {
            const mushroomSurprises = get('mushroom-surprise');
            const coinSurprises = get('coin-surprise');
            for (let mushroomSurprise of mushroomSurprises) {
                const marioDistance = mushroomSurprise.pos.x - mario.pos.x;
                if (mario.pos.y === mushroomSurprise.pos.y + 40 && marioDistance > -20 && marioDistance < 0) {
                    destroy(mushroomSurprise);
                    gameLevel.spawn('@', mushroomSurprise.gridPos.sub(0, 1));
                    gameLevel.spawn('+', mushroomSurprise.gridPos.sub(0, 0));
                    onUpdate('mushroom', (obj) => {
                        obj.move(mushroomMove, 0);
                    });
                }
            }
            for (let coinSurprise of coinSurprises) {
                const marioDistance = coinSurprise.pos.x - mario.pos.x;
                if (mario.pos.y === coinSurprise.pos.y + 40 && marioDistance > -20 && marioDistance < 0) {
                    destroy(coinSurprise);
                    gameLevel.spawn('*', coinSurprise.gridPos.sub(0, 1));
                    gameLevel.spawn('+', coinSurprise.gridPos.sub(0, 0));
                }
            }
        }
    });

    mario.onCollide('coin', (obj) => {
        destroy(obj);
    });

    onUpdate('evil-mushroom', (obj) => {
        obj.move(-evilMushroomMove, 0);
    });

    mario.onCollide('mushroom', (obj) => {
        destroy(obj);
    });

    mario.onCollide('evil-mushroom', (obj) => {
        if (mario.pos.y === obj.pos.y) {
            destroy(obj);
        } else {
            go('start');
        }
    });

    const gameLevel = addLevel([
        '                                                           ',
		'                                                           ',
        '        ***                                                ',
        '                                                           ',
        '                                                           ',
        '                 ****                                      ',
        '                                                           ',
        '                                                           ',
        '                 ====                                      ',
        '                                                           ',
        '                                                           ',
        '     **   =$=#=                                            ',
        '                                                           ',
        '                         ?                                 ',
        '                    ^  ^                    ^  ^       C   ',
        '===========================    ========   === ============',
                                                                 
    ], {
        // define the size of each block
        width: 20,
        height: 20,
        pos: vec2(0, -20),
        // define what each symbol means, by a function returning a component list (what will be passed to add())
        '=': () => [sprite('brick'), area(), solid(), 'brick'],
        '*': () => [sprite('coin'), area(), 'coin'],
        '$': () => [sprite('surprise-box'), solid(), area(), 'coin-surprise'],
        '#': () => [sprite('surprise-box'), solid(), area(), 'mushroom-surprise'],
        '^': () => [sprite('evil-mushroom'), solid(), area(), 'evil-mushroom', body()],
        '?': () => [sprite('pipe'), solid(), area()], 
        '+': () => [sprite('block'), solid(), area()],
        '@': () => [sprite('mushroom'), solid(), area(), 'mushroom', body()],
        // 'C': () => [sprite('castle'), area(), origin('bot'),scale(0.25), 'castle']
    });

    let timeLeft = 6000;

    const timer = add([
        
        text(timeLeft / 60, {
            size: 18,
            width: 320, 
            font: 'sinko', 
        }),
        pos(80, 30),
        layer('ui'),
        fixed(),
        {
            value: time
        },
        'timer'        
    ]);

    onUpdate('timer', (obj) => {
        timeLeft--; 
        if ((timeLeft / 60) % 1 === 0) {
            destroy(obj);
            const timer = add([
        
                text(timeLeft / 60, {
                    size: 18,
                    width: 320, 
                    font: 'sinko', 
                }),
                pos(80, 30),
                layer('ui'),
                fixed(),
                {
                    value: time
                },
                'timer'        
            ]);
        }
    });

    mario.onUpdate(() => {
        // camPos(mario.pos.x, 180);
        camPos(mario.pos);
    });

});

go('start');