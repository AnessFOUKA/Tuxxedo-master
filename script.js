imgDict={}

function removeObjectFromList(list,object){
    let listReturned=[];
    for (let i of list){
        if (i!=object){
            listReturned.push(i);
        }
    }
    return listReturned;
}

class stdCanvas{
    isJustCreated=true;
    constructor(elements){
        this.elements=elements;
    }
    create(){
    }
    step(){
        for (i of this.elements){
            if (i.isJustCreated){
                i.create();
                i.isJustCreated=false;
            }
            i.step();
        }
    }
    draw(){
        for (i of this.elements){
            i.draw();
        }
    }
}

class camera{
    constructor(x,y,width,height,givedMap){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.givedMap=givedMap;
    }
    showCameraZone(){
        if (this.x<=0){
            this.x=0;
        }
        if (this.x+this.width>=this.givedMap.width){
            this.x=this.givedMap.width-this.width;
        }
        if (this.y<=0){
            this.y=0;
        }
        if (this.y+this.height>=this.givedMap.height){
            this.y=this.givedMap.height-this.height;
        }
        for (let i of this.givedMap.elements){
            i.draw(i.x-this.x,i.y-this.y)
        }

        if (this.givedMap.player.x<=this.x){
            this.givedMap.player.x=this.x
        }

        if (this.givedMap.player.y<=this.y){
            this.givedMap.player.y=this.y
        }

        if (this.givedMap.player.x+this.givedMap.player.width>=this.x+this.width){
            this.givedMap.player.x=this.x+this.width-this.givedMap.player.width
        }
        
        if (this.givedMap.player.y+this.givedMap.player.height>=this.y+this.height){
            this.givedMap.player.y=this.y+this.height-this.givedMap.player.height
        }

        this.givedMap.player.draw(this.givedMap.player.x-this.x,this.givedMap.player.y-this.y);
    }
}

function collided(elem1,elem2){
    return (elem1.x < elem2.x + elem2.width &&
        elem1.x + elem1.width > elem2.x &&
        elem1.y < elem2.y + elem2.height &&
        elem1.y + elem1.height > elem2.y)
}
// Détection de collision entre deux éléments
function solid(elem1, elem2) {
    let elem1Final = elem1;
    if (elem1[0] !== undefined) {
        elem1Final = elem1[0]; // Si elem1 est un tableau, prendre le premier élément
    }

    // Vérification si elem2 est dans la zone d'influence étendue de elem1
    if (detectInbound(elem2, elem1Final.x - 50, elem1Final.y - 50, elem1Final.width + 50, elem1Final.height + 50)) {
        // Vérification de la collision entre les deux éléments
        if (collided(elem1Final,elem2)) {
            
            // Calcul des chevauchements sur les axes X et Y
            let overlapX = Math.min(elem1Final.x + elem1Final.width - elem2.x, elem2.x + elem2.width - elem1Final.x);
            let overlapY = Math.min(elem1Final.y + elem1Final.height - elem2.y, elem2.y + elem2.height - elem1Final.y);

            if (overlapX < overlapY) {
                // Collision sur l'axe X
                if (elem1Final.x + elem1Final.width / 2 < elem2.x + elem2.width / 2) {
                    elem1Final.x = elem1Final.x - overlapX; // Pousser à gauche
                } else {
                    elem1Final.x = elem1Final.x + overlapX; // Pousser à droite
                }
            } else {
                // Collision sur l'axe Y
                if (elem1Final.y + elem1Final.height / 2 < elem2.y + elem2.height / 2) {
                    elem1Final.y = elem1Final.y - overlapY; // Pousser vers le haut
                } else {
                    elem1Final.y = elem1Final.y + overlapY; // Pousser vers le bas
                }
            }

        }
    }
}

// Fonction de détection d'intrusion
function detectInbound(elem, x, y, width, height) {
    return !(elem.x + elem.width < x || elem.x > x + width || elem.y + elem.height < y || elem.y > y + height);
}

class map extends stdCanvas{
    constructor(elements,player,width,height){
        super(elements);
        this.player=player;
        this.width=width;
        this.height=height;
    }
    Camera=new camera(0,0,960,544,this);
    step(){
        this.player.step();
        this.player.motherCanvas=this;
        for (i of this.elements){
            if (i.isJustCreated){
                i.create();
                i.motherCanvas=this;
                i.isJustCreated=false;
            }
            i.step();
            if (i instanceof launchEventObject){
                if (i.solid==true){
                    solid(this.player,i)
                }
            }
        }
    }
    draw(){
        this.Camera.showCameraZone();
    }
}

class animatedImage{
    isJustCreated=true
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation){
        this.spritesheet=spritesheet;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.imageCoords=imageCoords;
        this.imageCoordsIndex=imageCoordsIndex;
        this.animationSpeed=animationSpeed;
        this.spritesheetLocation=spritesheetLocation;
    }
    create(){}
    step(){}
    draw(x=this.x,y=this.y){
        if (this.imageCoordsIndex<this.imageCoords.length-1){
            this.imageCoordsIndex+=this.animationSpeed
        }else{
            this.imageCoordsIndex=0
        }
        ctx.drawImage(this.spritesheet,this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],x,y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
    }
}

class enemy extends animatedImage{
    health=150;
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,enemyPatternEvent){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.enemyPatternEvent=enemyPatternEvent;
    }
    step(){
        if (this.health<=0){
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
    }
}

class gameEvent{
    index=0;
    isJustCreated=true;
    constructor(eventFunction,maxIndex,cache,eventSpeed,loop){
        this.eventFunction=eventFunction;
        this.maxIndex=maxIndex;
        this.cache=cache;
        this.eventSpeed=eventSpeed;
        this.loop=loop
    }
    create(){}
    step(){
        if (this.index<this.maxIndex){
            this.eventFunction(this)
            this.index+=1;
        }else{
            if (this.loop){
                this.index=0;
            }else{
                this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
            }
        }
    }
    draw(){}
}

class projectile extends animatedImage{
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,moveSpeed,sender,strength){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.moveSpeed=moveSpeed;
        this.sender=sender;
        this.strength=strength;
    }
    step(){
        this.y-=this.moveSpeed;
        if (!detectInbound(this,this.motherCanvas.Camera.x,this.motherCanvas.Camera.y,this.motherCanvas.Camera.width,this.motherCanvas.Camera.height)){
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
        if (collided(this,this.motherCanvas.player)&&this.motherCanvas.player!=this.sender){
            this.motherCanvas.player.health-=this.strength;
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
        for (let i of this.motherCanvas.elements){
            if ((i instanceof enemy || i instanceof character)&&i!=this.sender){
                if (collided(this,i)){
                    i.health-=this.strength;
                    this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
                }
            }
        }
    }
}

class launchEventObject extends animatedImage{
    isJustCreated=true
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,Event,solid){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.Event=Event;
        this.solid=solid;
    }
}

class character extends animatedImage{
isJustCreated=true
health=100;
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,imageCoordsList){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.imageCoordsList=imageCoordsList;
    }
    step(){
        for (let input of ([["ArrowLeft",-3,0],["ArrowRight",3,0],["ArrowUp",0,-3],["ArrowDown",0,3]])){
            if (controls[input[0]]){
                this.x+=input[1];
                this.y+=input[2];
            }
        }
        if (controls["x"]){
            this.motherCanvas.elements.push(new projectile(testImage,this.x,this.y-10,51,57,[[259,242,51,57],[314,242,51,57]],0,1,"images/testImage.png",20,this,5))
        }
        if(this.health<=0){
            console.log("won")
        }
    }
}

function mainloop(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 960, 544);
    
    for (let i of instancesList) {
        if (i.isJustCreated) {
            i.create();
            i.isJustCreated = false;
        }
        i.step();
        i.draw();
    }

    requestAnimationFrame(mainloop);
}

function surroundedByBracket(str, characterId) {
    let temp = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "[") {
            temp++;
        } else if (str[i] === "]") {
            temp--;
        } else if (temp > 0 && i === characterId) {
            return true;
        }
    }
    return false;
}

function customFirstOccurrenceOf(str, elem, step) {
    let a = step < 0 ? str.length - 1 : 0;
    let b = step < 0 ? -1 : str.length;
    for (let i = a; i !== b; i += step) {
        if (str[i] === elem && !surroundedByBracket(str, i)) {
            return i;
        }
    }
    return null;
}

function customSplit(str, separator) {
    let temp = [];
    let firstOccurrence = customFirstOccurrenceOf(str, separator, 1);
    
    if (firstOccurrence !== null) {
        temp.push(str.substring(0, firstOccurrence));
    } else {
        temp.push(str);
        return temp;
    }

    for (let i = 0; i < str.length; i++) {
        if (str[i] === separator && !surroundedByBracket(str, i)) {
            let nextCommaIndex = customFirstOccurrenceOf(str.substring(i + 1), separator, 1);
            if (nextCommaIndex !== null) {
                let nextComma = i + 1 + nextCommaIndex;
                temp.push(str.substring(i + 1, nextComma));
            } else {
                temp.push(str.substring(i + 1));
            }
        }
    }
    return temp;
}

function customLoads(str) {
    let temp = customSplit(str.substring(1, str.length - 1), ",");
    let finalList = [];
    
    for (let i of temp) {
        if (i.startsWith("[") && i.endsWith("]")) {
            finalList.push(customLoads(i));
        } else {
            finalList.push(i);
        }
    }
    return finalList;
}

function setControls(keysArray){
    keys={}
    for (i of keysArray){
        keys[i]=false;
        document.addEventListener("keydown",function(key){
            return function(event){
                if (event.key==key){
                    keys[key]=true;
                }
            }
        }(i))
        document.addEventListener("keyup",function(key){
            return function(event){
                if (event.key==key){
                    keys[key]=false;
                }
            }
        }(i))
    }
    return keys;
}
l=""

function convertArrayValuesToNumber(ArrayGived){
    let finalArray=[];
    for (let i of ArrayGived){
        if (typeof(i)!="string"){
            finalArray.push(convertArrayValuesToNumber(i))
        }else{
            finalArray.push(parseFloat(i))
        }
    }
    return finalArray;
}

function uncompress(array) {
    let finalArray = [];
    
    array.forEach(item => {
        let subList = item.split(";").map(Number);
        
        for (let j = 0; j < subList[0]; j++) {
            finalArray.push(subList[1]);
        }
    });
    
    return finalArray;
}

// Exemple d'utilisation
console.log(uncompress(["3;5", "2;8"])); 

function customReadarray(filename,callBack,imgMemDict){
    fetch(filename)
    .then(text=>{
        return text.text();
    })
    .then(data=>{
        lineBegining=0
        finalArray=[]
        for (let i=0;i<data.length;i++){
            if (data[i]=="\r"){
                finalArray.push(data.substring(lineBegining,i));
                lineBegining=i+2;
            }
        }
        return finalArray;
    })
    .then(data=>{
        finalArray=[];
        for (i of data){
            concernedList=customLoads(`[${i}]`)
            if (concernedList[0]=="animatedImage"){
                x=uncompress(concernedList[7])
                y=uncompress(concernedList[8])
                if (!(concernedList[6] in imgMemDict)){
                    imgMemDict[concernedList[6]]=new Image();
                    imgMemDict[concernedList[6]].src=concernedList[6]
                }
                for (let j=0;j<x.length;j++){
                    finalArray.push(new animatedImage(imgMemDict[concernedList[6]],x[j],y[j],Number(concernedList[1]),Number(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),Number(concernedList[4]),Number(concernedList[5]),concernedList[6]))
                }
            }
            else if (concernedList[0]=="launchEventObject"){
                x=uncompress(concernedList[9])
                y=uncompress(concernedList[10])
                if (!(concernedList[6] in imgMemDict)){
                    imgMemDict[concernedList[6]]=new Image();
                    imgMemDict[concernedList[6]].src=concernedList[6]
                }
                for (let j=0;j<x.length;j++){
                    finalArray.push(new launchEventObject(imgMemDict[concernedList[6]],x[j],y[j],Number(concernedList[1]),Number(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),Number(concernedList[4]),Number(concernedList[5]),concernedList[6],concernedList[7],concernedList[8]==="true"))
                }
            }
            else if (concernedList[0]=="enemy"){
                x=uncompress(concernedList[8])
                y=uncompress(concernedList[9])
                if (!(concernedList[6] in imgMemDict)){
                    imgMemDict[concernedList[6]]=new Image();
                    imgMemDict[concernedList[6]].src=concernedList[6]
                }
                for (let j=0;j<x.length;j++){
                    finalArray.push(new enemy(imgMemDict[concernedList[6]],x[j],y[j],Number(concernedList[1]),Number(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),Number(concernedList[4]),Number(concernedList[5]),concernedList[6],concernedList[7]))
                }
            }
        }
        console.log(finalArray);
        return finalArray;
    })
    .then(finaldata=>{
        callBack(finaldata)
    })
}

let gameScreen=document.createElement("canvas");
gameScreen.id="gameScreen";
gameScreen.width=960;
gameScreen.height=544;
let ctx=gameScreen.getContext('2d');
controls=setControls(["ArrowLeft","ArrowUp","ArrowRight","ArrowDown","x","w","Control"]);
let testImage=new Image();
testImage.src="images/testImage.png"
instancesList=[new map([],new character(testImage,50,50,165,102,[[21,12,165,102]],0,0.1,"images/testImage.png",[]),960,544)]
customReadarray("test.csv",function(array){instancesList[0].elements=array;instancesList[0].elements.push(new enemy(testImage,50,50,96,90,[[126,339,96,90]],0,0.1,"images/testImage.png",0));instancesList[0].elements.push(new projectile(testImage,350,50,96,90,[[126,339,96,90]],0,0.1,"images/testImage.png",0,instancesList[0].elements[instancesList[0].elements.length-2],5));},imgDict)
mainloop();

document.body.appendChild(gameScreen);
