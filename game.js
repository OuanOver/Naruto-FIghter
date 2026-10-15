var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        {
            preload: preload,
            create: create,
            update: update
        }
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

var game = new Phaser.Game(config);
var scene;
var player;
var keyUp, keyDown;
var keyLeft, keyRight;
var keyFire;
var bulletSpeed = 1200;
var painBulletSpeed = 450;
var playerBulletGrp;

var painGrp;
var painSpacing = 130;

var explosionGrp;
var painBulletGrp;
var playerkunai = 3;
var kunaiGrp;
var gameOver = false;
var konoha;

function preload() {
    //console.log("preloading");
    scene = this;
    scene.load.image('rasen', 'photo/rasen.png');
    scene.load.image('rasengan', 'photo/rasengan.png');
    scene.load.image('pain', 'photo/pain.png');
    scene.load.image('explosion', 'photo/explosion.png');
    scene.load.image('pain_bullet', 'photo/pain_bullet.png');
    scene.load.image('kunai', 'photo/kunai.png');
    scene.load.image('konoha', 'photo/konoha.jpg');

}

function create() {
    //console.log("create");
    createBackground();
    createPlayer();

    playerBulletGrp = scene.add.group();

    painGrp = scene.add.group();
    painBulletGrp = scene.add.group();
    createPain();

    explosionGrp = scene.add.group();
    kunaiGrp = scene.add.group();
    createPlayerKunai();

    scene.physics.add.overlap(painGrp, playerBulletGrp, onPainHit);
    scene.physics.add.overlap(player, painBulletGrp, onPlayerHit);
    scene.physics.add.overlap(player, painGrp, onPlayerHit);

    keyUp = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    keyDown = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    keyFire = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}

function createBackground() {
    konoha = scene.add.image(config.width / 2, config.height / 2, 'konoha')
        .setDisplaySize(config.width, config.height)
        .setAlpha(0.3)
        .setDepth(-1);
}

function createPlayer() {
    player = scene.physics.add.sprite(config.width/2, config.height/2, 'rasen');
    player.setScale(0.2);
    player.speed = 400;
    player.immortal = false;
}

function createPain() {
    for (var i = 0; i < 5; i++) {
        var pain = scene.physics.add.sprite(1000,100 + (i * painSpacing),"pain");
        pain.setScale(0.1);
        pain.speed = (Math.random() * 2) + 1;
        pain.startX = config.width + (pain.width / 2);
        pain.startY = 100 + (i * painSpacing);
        pain.x = pain.startX;
        pain.y = pain.startY;
        pain.magnitude = Math.random() * 80;
        pain.fireInterval = (Math.random() * 3000) + 2500;
        pain.fireTimer = scene.time.addEvent({
            delay: pain.fireInterval,
            args: [pain],
            callback: painFire,
            repeat: -1
        });

        painGrp.add(pain);

    }
}

function createPlayerKunai() {
    for (var i = 0; i < playerkunai; i++) {
        var kunai = scene.add.sprite(40 + (i * 85), 40, "kunai");
        kunai.setScale(0.2);
        kunai.depth = 10;
        kunaiGrp.add(kunai);
    }
}

function update() {
    if (gameOver) {
        return;
    }

    updatePlayer();
    updatePlayerBullets();
    updatePainBullets();

    updatePain();

    updateExplosion(); 


}

function updatepainBullets() {
  
    for (var i = 0; i < painBulletGrp.getChildren().length; i++) {
        var bullet = painBulletGrp.getChildren()[i];

        if (bullet.x < 0 - (bullet.width / 2)) {
            bullet.destroy();
        }
    }
}

function updatePlayer() {
    //console.log("update");
    if (keyUp.isDown) {
        player.setVelocityY(-player.speed);
    }
    else if (keyDown.isDown) {
        player.setVelocityY(player.speed);
    }
    else {
        player.setVelocityY(0);
    }

    if (keyLeft.isDown) {
        player.setVelocityX(-player.speed);
    }
    else if (keyRight.isDown) {
        player.setVelocityX(player.speed);
    }
    else {
        player.setVelocityX(0);
    }

    if (player.y < 0 + (player.getBounds().height / 2)) {
        //console.log("hit the top screen");
        player.y = (player.getBounds().height / 2);
    }
    else if (player.y > config.height - (player.getBounds().height / 2)) {
        //console.log("hit the bottom screen");
        player.y = config.height - (player.getBounds().height / 2);
    }

    if (player.x < 0 + (player.getBounds().width / 2)) {
        //console.log("hit the left screen");
        player.x = (player.getBounds().width / 2);
    }
    else if (player.x > config.width - (player.getBounds().width / 2)) {
        //console.log("hit the right screen");
        player.x = config.width - (player.getBounds().width / 2);
    }

    if (Phaser.Input.Keyboard.JustDown(keyFire)) {
        fire();
    }
}

function updatePlayerBullets() {
    for (var i = 0; i < playerBulletGrp.getChildren().length; i++) {
        //console.log(playerBulletGrp.getChildren()[i]);
        var bullet = playerBulletGrp.getChildren()[i];
        bullet.rotation += 1;

        if(bullet.x > config.width) {
            bullet.destroy();
        }
    }
    //console.log("=======================")
}

function updatePain() {
    for(var i = 0; i < painGrp.getChildren().length; i++) {
        var enemy = painGrp.getChildren()[i];
        enemy.x -= enemy.speed;
        enemy.y = enemy.startY + (Math.sin(scene.time.now / 1000) * enemy.magnitude);

        if(enemy.x < 0 - (enemy.width / 2)) {
            enemy.speed = (Math.random() * 2) + 1;
            enemy.x = enemy.startX;
            enemy.magnitude = Math.random() * 80;
        }
    }
}

function updatePainBullets() {
    for (var i = 0; i < painBulletGrp.getChildren().length; i++) {
        var bullet = painBulletGrp.getChildren()[i];

        if (bullet.x < -bullet.width || bullet.x > config.width + bullet.width) {
            bullet.destroy();
        }
    }
}

function updateExplosion() {
    for(var i = explosionGrp.getChildren().length - 1; i >= 0; i--) {
        var explosion = explosionGrp.getChildren()[i];
        explosion.rotation += 0.04;
        explosion.scale += 0.02;
        explosion.alpha -= 0.05;

        if(explosion.alpha <= 0) {
            explosion.destroy();
        }
    }
}

function fire() {
    console.log("Fire a bullet!");
    var bullet = scene.physics.add.sprite(player.x + 50, player.y + 10, 'rasengan');
    bullet.setScale(0.10);
    bullet.body.velocity.x = bulletSpeed;

    playerBulletGrp.add(bullet);
    
}   

function onPainHit(pain, bullet) {
    createExpLosion(pain.x, pain.y);


    bullet.destroy();
    pain.x = pain.startX;
    pain.speed = (Math.random() * 2) + 1;
}

function createExpLosion(posx, posy) {
    var explosion = scene.add.sprite(posx, posy, 'explosion');
    explosion.setScale(0.2);
    explosion.rotation = Phaser.Math.Between(0, 360);

    explosionGrp.add(explosion);

}
function painFire(enemy) {
    var bullet = scene.physics.add.sprite(enemy.x - 50, enemy.y, 'pain_bullet');
    bullet.setScale(0.3);
    bullet.body.velocity.x = -painBulletSpeed;
    painBulletGrp.add(bullet);
    
    painBulletGrp.add(bullet);   
}

function onPlayerHit(player, obstacle) {
    if (gameOver) {
        return;
    }

    if (obstacle.texture.key === "pain_bullet") {
        obstacle.destroy();
    } else {
        obstacle.x = obstacle.startX;
        obstacle.y = obstacle.startY;
    }

    if (player.immortal) {
        return;
    }

    player.immortal = true;
    playerkunai = Math.max(0, playerkunai - 1);
    updateplayerkunai();

    scene.tweens.add({
        targets: player,
        alpha: 0.2,
        duration: 90,
        yoyo: true,
        repeat: 4,
        onComplete: function () {
            player.setAlpha(1);
            player.immortal = false;
        }
    });

    if (playerkunai === 0) {
        gameOver = true;
        console.log("Game Over");
        player.setVelocity(0, 0);
        painGrp.getChildren().forEach(function (pain) {
            pain.fireTimer.remove();
        });
        scene.physics.pause();
    }
}

function updateplayerkunai() {
    for (var i = kunaiGrp.getChildren().length - 1; i >= 0; i--) {
        if (playerkunai < i+1){
            kunaiGrp.getChildren()[i].setVisible(false);
        }
        else {
            kunaiGrp.getChildren()[i].setVisible(true);
        }
    }
}