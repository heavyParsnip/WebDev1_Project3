//////////////////////////////////////////
// This file is responsible for holding //
// classes, maps, and other structures  //
// for the game to draw info from.      //
//////////////////////////////////////////

// CLASSES
class GameObject {
    constructor(type, x, y) {
        this.x = x;
	    this.y = y;
        this.element = undefined;
        this.type = type;
    }

    moveRight(){this.x++;};
	moveDown(){this.y++;};
	moveLeft(){this.x--;};
	moveUp(){this.y--;};
}

class Player extends GameObject {
    constructor(x, y, maxHealth) {
        super("player", x, y);
		this.maxHealth = maxHealth;
		this.health = maxHealth;
		this.attack = 3;
		this.className = cssClass.PLAYER;
		this.facing = "down";
		this.waterWalk = false;
		this.inventory = [];
		this.alive = true;
	}
	
	itemPickup(item) {
		this.inventory.push(item);
	}
}

class Monster extends GameObject {
	constructor(x, y, className) {
        super("monster", x, y);
		this.className = className;
		this.facing = "down";
		this.item = null;
		this.isAggro = false;
		switch(className) {
			case cssClass.IMP:
				this.name = "Imp";
				this.attack = 2;
				this.maxHealth = 4;
				this.health = 4;
				this.aggro = 5;
				break;
			case cssClass.WRAITH:
				this.name = "Wraith";
				this.attack = 6;
				this.maxHealth = 2;
				this.health = 2;
				this.aggro = 5;
				break;
			case cssClass.GORGON:
				this.name = "Gorgon";
				this.attack = 3;
				this.maxHealth = 7;
				this.health = 7;
				this.aggro = 7;
				break;
			case cssClass.BLOB:
				this.name = "Blob";
				this.attack = 2;
				this.maxHealth = 2;
				this.health = 2;
				this.aggro = 5;
				break;
			case cssClass.ABOM:
				this.name = "Abomination";
				this.attack = 5;
				this.maxHealth = 4;
				this.health = 4;
				this.aggro = 4;
				break;
			case cssClass.DRAGON:
				this.name = "Dragon";
				this.attack = 4;
				this.maxHealth = 9;
				this.health = 9;
				this.aggro = 3;
				break;
			case cssClass.BALOR:
				this.name = "Balor";
				this.attack = 6;
				this.maxHealth = 20;
				this.health = 20;
				this.aggro = 5;
				break;
			case cssClass.ANIMARMOR:
				this.name = "Animated Armor";
				this.attack = 2;
				this.maxHealth = 10;
				this.health = 10;
				this.aggro = 5;
				break;
			case cssClass.SPECTER:
				this.name = "Specter";
				this.attack = 3;
				this.maxHealth = 2;
				this.health = 2;
				this.aggro = 7;
				break;
			case cssClass.SECRET:
				this.name = "???";
				this.attack = 10;
				this.maxHealth = 30;
				this.health = 30;
				this.aggro = 4;
				break;
		}
	}
	
	//Modified version of checkIsLegalMove, as some monsters have varying movement rules
	checkIsLegalMonsterMove(nextX,nextY, player){
		let nextTile = currentGameWorld[nextY][nextX];

		// First check if the tile is occupied. Monsters should always attack if the player is adjacent,
		// so this is a failsafe to prevent monsters from moving inside the player
		if(player.x == nextX && player.y == nextY) {
			return false;
		}

		// Some monsters can traverse over water and through walls, so check for those first
		if(this.className == cssClass.SPECTER) {
			return true;
		}
		else if((this.className == cssClass.IMP || this.className == cssClass.WRAITH) && nextY != worldTile.WATER) {
			return true;
		}
		else if (nextTile != worldTile.WALL && nextTile != worldTile.WATER){
			return true;
		}
		else {
			return false;
		}

	}

	// Move towards the player. Called as long as isAggro is true. Uses an if-chain and returns instead
	// of else-if for more optimized movement behavior.
	pursue(player) {
		let nextX;
		let nextY;

		if(this.x > player.x) {
			nextX = this.x - 1;
			nextY = this.y;
			if(this.checkIsLegalMonsterMove(nextX,nextY,player)) {
				this.moveLeft();
				return;
			}
		}
		if(this.x < player.x) {
			nextX = this.x + 1;
			nextY = this.y;
			if(this.checkIsLegalMonsterMove(nextX,nextY,player)) {
				this.moveRight();
				return;
			}
		}
		if(this.y < player.y) {
			nextX = this.x;
			nextY = this.y + 1;
			if(this.checkIsLegalMonsterMove(nextX,nextY,player)) {
				this.moveDown();
				return;
			}
		}
		if(this.y > player.y) {
			nextX = this.x;
			nextY = this.y - 1;
			if(this.checkIsLegalMonsterMove(nextX,nextY,player)) {
				this.moveUp();
				return;
			}
		}
	}

	// Checks if the player is on a tile adjacent to this monster
	isPlayerAdjacent(player) {
		if((player.x == this.x && player.y == this.y+1) || //Above 
			(player.x == this.x && player.y == this.y-1) || //Below
			(player.x == this.x+1 && player.y == this.y) || //Right
			(player.x == this.x-1 && player.y == this.y)) { //Left
			return true;
		}
		else {
			return false;
		}
	}

	// Attack the player!
	tryAttack(player) {
		let attackInfo = [this.name,this.attack];
		player.health -= this.attack;
		return attackInfo;
	}

	// The master monster method. This gets called every frame. Responsible for checking for triggering aggro,
	// monster movement, attacking when conditions are right, and anything else monsters may do during their turn.
	think(player) {

		// First check for aggro engaging or disengaging
		if(Math.sqrt(Math.pow(this.x-player.x, 2) + Math.pow(this.y-player.y, 2)) < this.aggro) {
			this.isAggro = true;
		}
		else {
			this.isAggro = false;
		}

		// Second check if the monster has the opportunity to attack
		if(this.isPlayerAdjacent(player)) {
			let attackInfo = this.tryAttack(player);
			return attackInfo;
		}
		// Third check if the monster should pursue the player
		else if(this.isAggro) {
			this.pursue(player);
		}
		return null;
	}
}

class Key extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.KEY1;
		this.name = "Key";
	}
}

class LootBag extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.LOOTBAG;
		this.name = "Loot Bag";
	}
}

class Gem extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.GEM;
		this.name = "Gem";
	}
}

class Ring extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.RING1;
		this.name = "Ring";
	}
}

class Elixir extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.ELIXIR;
		this.name = "Red Elixir";
	}
}

class Concoction extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.CONCOCTION;
		this.name = "Magenta Concoction";
	}
}

class Brew extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.BREW;
		this.name = "Pale Brew";
	}
}

class Apple extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.APPLE;
		this.name = "Apple";
	}
}

class Bell extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.BELL;
		this.name = "Strange Bell";
	}
}

class Pot extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.POT;
		this.name = "Pot";
	}
}

class Boots extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.BOOTS;
		this.name = "Rain Boots";
	}
}

class Trumpet extends GameObject {
	constructor(x, y) {
		super("item", x, y);
		this.className = cssClass.TRUMPET;
		this.name = "Trumpet";
	}
}



// CONSTANTS

const gameworld = {

	world1: [ 
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
		[0,1,0,0,0,0,1,3,3,1,1,0,3,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
		[0,1,1,0,1,1,1,3,3,3,1,0,3,3,3,0,0,0,0,1,1,1,1,1,0,1,0,0,0,0,0],
		[0,0,1,0,1,1,1,3,3,3,1,0,3,3,1,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0],
		[0,0,1,0,3,3,1,3,3,3,1,0,3,3,3,3,3,3,0,3,0,1,1,1,1,1,1,1,1,1,1],
		[0,0,1,0,1,3,3,3,3,3,1,0,3,3,3,3,3,1,0,3,0,0,0,0,0,0,0,1,3,3,1],
		[0,0,1,0,1,3,3,3,3,3,1,0,3,3,3,3,3,3,0,3,1,1,1,1,1,1,0,1,3,3,1],
		[0,1,1,0,1,1,3,3,1,3,1,0,3,1,3,3,3,3,0,3,3,3,3,3,3,0,0,3,3,3,1],
		[0,1,0,0,0,0,0,0,1,3,1,0,1,1,1,3,3,1,0,3,3,3,3,3,3,0,1,1,3,3,1],
		[0,1,0,0,0,0,0,0,1,1,1,0,1,1,3,3,3,1,0,3,3,3,3,3,1,0,1,3,3,3,1],
		[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,1,1,1,1,0,1,1,3,3,1],
		[0,1,0,0,0,0,0,0,1,1,1,1,3,3,3,3,3,3,0,1,3,1,0,0,0,0,0,1,3,3,1],
		[0,1,1,1,1,1,1,1,1,0,1,3,3,3,3,3,3,1,0,1,1,1,0,5,0,0,0,1,3,3,1],
		[0,0,0,0,0,0,0,0,0,0,1,3,3,3,1,1,1,1,0,0,0,0,0,0,0,0,0,3,3,3,1],
		[0,0,0,0,0,0,0,0,0,0,1,1,3,3,1,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	]
};


// these map to the CSS classes in main.css
const cssClass = Object.freeze({
	IMP: 		"imp",
	WRAITH: 	"wraith",
	GORGON: 	"gorgon",
	BLOB:		"blob",
	ABOM:		"abomination",
	DRAGON:		"dragon",
	BALOR:		"balor",
	ANIMARMOR:	"animatedarmor",
	SPECTER:	"specter",
	SECRET:		"secret",
	PLAYER: 	"player",
	ELIXIR:		"elixir",
	CONCOCTION:	"concoction",
	BREW:		"brew",
	APPLE:		"apple",
	GEM: 		"gem",
	BELL:		"bell",
	LOOTBAG:	"lootbag",
	KEY1: 		"key1",
	POT: 		"pot",
	BOOTS:		"boots",
	TRUMPET:	"trumpet",
	RING1: 		"ring1"
});

const allGameObjects = {
	level1:[

		new Monster(14, 13, cssClass.IMP),
		new Monster(16, 13, cssClass.IMP),
		new Monster(26, 18, cssClass.WRAITH),
		new Monster(15, 4, cssClass.GORGON),
		new LootBag(25, 16),
		new Key(17, 3),
		new Apple(15, 5),
		new Gem(5, 12),
		new Ring(6, 14)
	]
}


