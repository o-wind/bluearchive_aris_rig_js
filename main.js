const circleRadius = 10;
var isVisibleBone = true;
var isVisibleJoint = true;
var canvas = document.getElementById('owind')

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

class Bone {
    constructor(x, y, lineLength, angle, context, scale = 1, isFix = true) {
        this.x = x * scale;
        this.y = y * scale;
        this.lineLength = lineLength * scale;
        this.angle = angle;
        this.ctx = context;
        this.children = [];
        this.absoluteX = 0;
        this.absoluteY = 0;
        this.absoluteAngle = 0;
        this.endX = 0;
        this.endY = 0;
        this.parent = null;

        this.minAngle = -90.0;
        this.maxAngle = 90.0;
        this.isFix = isFix;

        this.calculateCoordinates();
    }

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    calculateCoordinates() {
        this.absoluteAngle = this.angle;
        if (this.parent) {
            this.absoluteAngle += this.parent.absoluteAngle;
            this.absoluteX =
                -1 *
                (this.x * Math.cos(this.parent.absoluteAngle) -
                    this.y * Math.sin(this.parent.absoluteAngle));
            this.absoluteY =
                -1 *
                (this.x * Math.sin(this.parent.absoluteAngle) +
                    this.y * Math.cos(this.parent.absoluteAngle));
            this.absoluteX += this.parent.endX;
            this.absoluteY += this.parent.endY;
        } else {
            this.absoluteX = this.x;
            this.absoluteY = this.y;
        }

        this.endX = this.absoluteX + this.lineLength * Math.cos(this.absoluteAngle);
        this.endY = this.absoluteY + this.lineLength * Math.sin(this.absoluteAngle);

        this.children.forEach((child) => child.calculateCoordinates());
    }

    draw() {
        if(isVisibleBone) {
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.33)';
            this.ctx.beginPath();
            this.ctx.moveTo(this.absoluteX, this.absoluteY);
            this.ctx.lineTo(this.endX, this.endY);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        if(this.isFix && isVisibleJoint) {
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = 'rgba(180, 180, 255, 0.66)';
            this.ctx.beginPath();
            this.ctx.arc(this.endX, this.endY, circleRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        this.children.forEach((child) => child.draw());
    }

    pointToward(pointX, pointY) {
        if (this.isFix) {
            const deltaX = pointX - this.absoluteX;
            const deltaY = pointY - this.absoluteY;
            this.angle = Math.atan2(deltaY, deltaX);
            if (this.parent) {
                this.angle -= this.parent.absoluteAngle;
            }
        }
        this.calculateCoordinates();
    }

    checkMouse(x, y) {
        return Math.abs(x - this.endX) <= circleRadius && Math.abs(y - this.endY) <= circleRadius;
    }

    getAbsoluteX() {
        return parseFloat(this.absoluteX);
    }
    getAbsoluteY() {
        return double(this.absoluteY);
    }
    getAbsoluteAngle() {
        return double(this.absoluteAngle);
    }
}

class Skeleton {
    constructor(context, scale) {
        this.ctx = context;

        this.haloImg = new Image();
        this.backHairImg = new Image();
        this.leftLegImg = new Image();
        this.rightLegImg = new Image();
        this.bodyImg = new Image();
        this.leftArmImg = new Image();
        this.rightArmImg = new Image();
        this.faceImg = new Image();
        this.eyeImg = new Image();
        this.mouseImg = new Image();
        this.frontHairImg = new Image();
        this.sideHairImg = new Image();

        this.haloImg.src = './parts/0_halo.png';
        this.haloImg.onload = function () { console.log("loadimage"); }

        this.backHairImg.src = './parts/1_hair.png';
        this.backHairImg.onload = function () { }

        this.leftLegImg.src = './parts/2_leg_l.png';
        this.leftLegImg.onload = function () { }

        this.rightLegImg.src = './parts/2_leg_r.png';
        this.rightLegImg.onload = function () { }

        this.bodyImg.src = './parts/3_body.png';
        this.bodyImg.onload = function () { }

        this.leftArmImg.src = './parts/left_arm.png';
        this.leftArmImg.onload = function () { }

        this.rightArmImg.src = './parts/right_arm.png';
        this.rightArmImg.onload = function () { }

        this.faceImg.src = './parts/7_face.png';
        this.faceImg.onload = function () { }

        this.eyeImg.src = './parts/eye.png';
        this.eyeImg.onload = function () { }

        this.mouseImg.src = './parts/mouse.png';
        this.mouseImg.onload = function () { }

        this.frontHairImg.src = './parts/6_front_hair.png';
        this.frontHairImg.onload = function () { }

        this.sideHairImg.src = './parts/5_side_hair.png';
        this.sideHairImg.onload = function () { }

        // if(this.ctx != null) {
        //     this.loadImages();
        // }

        this.bones = []; 

        var spinePos = 410;
        var lenSpine = 100;

        // spine //

        const chestBone = new Bone(300, spinePos, lenSpine, degreesToRadians(270), context, scale);
        this.bones.push(chestBone);

        // face

        const headBone = new Bone(0, 0, 160, degreesToRadians(0), context, scale);
        chestBone.addChild(headBone);
        this.bones.push(headBone);

        const haloBone = new Bone(-40, 60, 30, degreesToRadians(0), context, scale);
        headBone.addChild(haloBone);
        this.bones.push(haloBone);

        const frontHairBone = new Bone(0, 0, 30, degreesToRadians(0), context, scale, false);
        headBone.addChild(frontHairBone);
        this.bones.push(frontHairBone);

        const sideHairBone = new Bone(20, -160, 100, degreesToRadians(180), context, scale);
        frontHairBone.addChild(sideHairBone);
        this.bones.push(sideHairBone);
        
        // body //

        const leftShoulderBone = new Bone(40, 0, 70, degreesToRadians(-90), context, scale, false);
        chestBone.addChild(leftShoulderBone);
        this.bones.push(leftShoulderBone);

        const leftArm = new Bone(0, 0, 75, degreesToRadians(-25), context, scale);
        leftShoulderBone.addChild(leftArm);
        this.bones.push(leftArm);

        const rightShoulderBone = new Bone(40, 0, 70, degreesToRadians(90), context, scale, false);
        chestBone.addChild(rightShoulderBone);
        this.bones.push(rightShoulderBone);

        const rightArm = new Bone(0, 0, 75, degreesToRadians(25), context, scale);
        rightShoulderBone.addChild(rightArm);
        this.bones.push(rightArm);

        const leftPelvisBone = new Bone(lenSpine, 0, 75, degreesToRadians(210), context, scale, false);
        chestBone.addChild(leftPelvisBone);
        this.bones.push(leftPelvisBone);

        const leftLeg = new Bone(0, 0, 75, degreesToRadians(-25), context, scale);
        leftPelvisBone.addChild(leftLeg);
        this.bones.push(leftLeg);

        const rightPelvisBone = new Bone(lenSpine, 0, 75, degreesToRadians(-210), context, scale, false);
        chestBone.addChild(rightPelvisBone);
        this.bones.push(rightPelvisBone);

        const rightLeg = new Bone(0, 0, 75, degreesToRadians(25), context, scale);
        rightPelvisBone.addChild(rightLeg);
        this.bones.push(rightLeg);

        // image
        
        this.calculateCoordinates();
    }

    draw() {
        this.drawImages();
        this.bones[0].draw();
    }

    calculateCoordinates() {
        this.bones[0].calculateCoordinates();
    }

    loadImages() {
        this.haloImg.src = './parts/0_halo.png';
        this.haloImg.onload = function () { console.log("loadimage"); }

        this.backHairImg.src = './parts/1_hair.png';
        this.backHairImg.onload = function () { }

        this.leftLegImg.src = './parts/2_leg_l.png';
        this.leftLegImg.onload = function () { }

        this.rightLegImg.src = './parts/2_leg_r.png';
        this.rightLegImg.onload = function () { }

        this.bodyImg.src = './parts/3_body.png';
        this.bodyImg.onload = function () { }

        this.leftArmImg.src = './parts/left_arm.png';
        this.leftArmImg.onload = function () { }

        this.rightArmImg.src = './parts/right_arm.png';
        this.rightArmImg.onload = function () { }

        this.faceImg.src = './parts/7_face.png';
        this.faceImg.onload = function () { }

        this.eyeImg.src = './parts/eye.png';
        this.eyeImg.onload = function () { }

        this.mouseImg.src = './parts/mouse.png';
        this.mouseImg.onload = function () { }

        this.frontHairImg.src = './parts/6_front_hair.png';
        this.frontHairImg.onload = function () { }

        this.sideHairImg.src = './parts/5_side_hair.png';
        this.sideHairImg.onload = function () { }
    }

    drawBoneImage(img, bone, imgX = 0.0, imgY = 0.0, origAngle = 0.0) {
        this.ctx.save();
        this.ctx.translate(bone.absoluteX, bone.absoluteY);
        
        var dAngle = bone.absoluteAngle - origAngle*Math.PI/180.0;
        this.ctx.rotate(dAngle); //*Math.PI/180
        this.ctx.drawImage(img, 0 - imgX, 0 - imgY, 600, 600);
        this.ctx.restore();
    }

    drawImages() {
        var imgCenter = [
            [300, 400],
            [300, 300],
            [240, 100],
            [300, 140],
            [460, 130],
            [300, 340],
            [300, 340],
            [370, 340],
            [300, 400],
            [262.5, 465],
            [300, 400],
            [337.5, 464.95],
        ];

        //console.log(this.bones[12].absoluteAngle/Math.PI*180);

        this.drawBoneImage(this.haloImg, this.bones[2], 240, 100, 270.0);
        this.drawBoneImage(this.backHairImg, this.bones[1], 300, 300, 270.0);
        this.drawBoneImage(this.rightLegImg, this.bones[10], 262.5, 465, 455.0);
        this.drawBoneImage(this.leftLegImg, this.bones[12], 337.5, 464.95, 85.0);
        this.drawBoneImage(this.bodyImg, this.bones[0], 300, 400, 270.0);
        this.drawBoneImage(this.faceImg, this.bones[1], 300, 300, 270.0);
        this.drawBoneImage(this.eyeImg, this.bones[1], 300, 300, 270.0);
        this.drawBoneImage(this.mouseImg, this.bones[1], 300, 300, 270.0);
        this.drawBoneImage(this.frontHairImg, this.bones[3], 300, 140, 270.0);
        this.drawBoneImage(this.sideHairImg, this.bones[4], 460, 130, 90.0);
        this.drawBoneImage(this.leftArmImg, this.bones[6], 230, 340, 155.0);
        this.drawBoneImage(this.rightArmImg, this.bones[8], 370, 340, 370.0);
    }
}

class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        const scale = canvas.width / 600; // default width is 600px, but can scale down to fit window
        
        this.currentHoverBone = null;
        this.currentDragBone = null;

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', this.handleMouseMove);

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('touchstart', this.handleMouseDown);

        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchend', this.handleMouseUp);
        this.canvas.addEventListener('touchcancel', this.handleMouseUp);

        this.skeleton = new Skeleton(this.ctx, scale);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#edf2fb";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.skeleton.draw();
    }

    handleMouseDown(event) {
        const { x, y } = this.getEventCoordinates(event);

        this.currentDragBone = this.skeleton.bones.find((bone) => bone.checkMouse(x, y));
    }

    handleMouseUp() {
        this.currentDragBone = null;
    }

    handleMouseMove(event) {
        event.preventDefault();
        const { x, y } = this.getEventCoordinates(event);
        if (this.currentDragBone) {
            this.currentDragBone.pointToward(x, y);
            this.draw();
        } else {
            this.currentHoverBone = this.skeleton.bones.find((bone) => bone.checkMouse(x, y));
            this.canvas.style.cursor = this.currentHoverBone ? 'pointer' : 'default';
        }
    }

    getEventCoordinates(event) {
        const clientX = event.clientX || event?.touches[0]?.clientX;
        const clientY = event.clientY || event?.touches[0]?.clientY;
        const boundingRect = this.canvas.getBoundingClientRect();
        const x = clientX - boundingRect.left;
        const y = clientY - boundingRect.top;
        return { x, y };
    }
}

var manager = new CanvasManager(canvas);

function arisOn() {
    manager.draw();
}

function toggleBone() {
    isVisibleBone = !isVisibleBone;
    if(manager != null) {manager.draw();}
}

function toggleJoint() {
    isVisibleJoint = !isVisibleJoint;
    if(manager != null) {manager.draw();}
}