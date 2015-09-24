var helperUtils = {
    createShaderFromScriptElement: function(gl, id, xShift) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        if (xShift) {
            str = str.replace(/vec2 axisShift.*?;/gi, "vec2 axisShift = vec2(" + parseFloat(xShift) + ", 1.0);");
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },
    clone: function (obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
};

function GLScene() {
    this.xShift = 1.0;
    this.glSceneInit();
};

GLScene.prototype.glSceneInit = function(xDeltaShift) {
    var canvas = document.getElementById("canvas");
    this.gl = canvas.getContext("experimental-webgl");

    if (xDeltaShift) {
        this.xShift = this.xShift + xDeltaShift;
    }
    var vertexShader = helperUtils.createShaderFromScriptElement(this.gl, "vertex-shader", this.xShift);
    var fragmentShader = helperUtils.createShaderFromScriptElement(this.gl, "fragment-shader");
    this.program = this.gl.createProgram();

    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        console.log("ERROR: Could not initialise shaders");
    }

    this.gl.useProgram(this.program);
};

GLScene.prototype.calculateCoords = function() {
    this.ATTRIBUTES = null;
    this.vertexData = null;
    this.vertexDataTyped = null;
};

GLScene.prototype.drawObjects = function(glObject) {
    var blackColor = [
        0.0,  0.0,  0.0,  1.0    // black
    ];

    var redColor = [
        1.0,  0.0,  0.0,  1.0    // red
    ];
    
    var currColor;
    if (glObject.color === 'red') {
        currColor = redColor;
    } else {
        currColor = blackColor;
    }

    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, glObject.vertexDataTyped, this.gl.STATIC_DRAW);

    var resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    var canvasProps = document.defaultView.getComputedStyle(document.getElementById("canvas"), null);
    this.gl.uniform2f(resolutionLocation, parseFloat(canvasProps.getPropertyValue('width')), parseFloat(canvasProps.getPropertyValue('height')));
    
    var positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, glObject.ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);

    var color = this.gl.getUniformLocation(this.program, "u_color");
    currColor.unshift(color);
    this.gl.uniform4f.apply(this.gl, currColor);

    this.gl.drawArrays(this.gl.LINE_LOOP, 0, glObject.vertexData.length / glObject.ATTRIBUTES);  
};

function CircleGlObject(xc, yc, circleR, color) {
    this.xc = xc;
    this.yc = yc;
    this.circleR = circleR;
    this.color = color;
    this.id = Math.random().toString().slice(2) +
    Math.random().toString().slice(2) +
    Math.random().toString().slice(2) +
    Math.random().toString().slice(2);
};

CircleGlObject.prototype.calculateCoords = function(xc, yc, circleR, color) {
    this.xc = xc || this.xc || 100;
    this.yc = yc || this.yc || 100;
    this.circleR = circleR || this.circleR || 45;
    this.color = color || this.color || 'black';

    var circle = {
        x: this.xc,
        y: this.yc,
        r: this.circleR 
    };
    this.ATTRIBUTES = 2;
    var numFans = 34;
    var degreePerFan = (2 * Math.PI) / numFans;
    this.vertexData = [];

    for (var i = 0; i <= numFans; i++) {
        var index = this.ATTRIBUTES * i + 2;
        var angle = degreePerFan * (i + 1);
        this.vertexData[index] = circle.x + Math.cos(angle) * circle.r;
        this.vertexData[index + 1] = circle.y + Math.sin(angle) * circle.r;
    }

    this.vertexDataTyped = new Float32Array(this.vertexData);
};

function CircleContainer(glScene) {
    this.circleContainerInit();
    this.glScene = glScene;
};

CircleContainer.prototype.add = function(circle) {
    circle.calculateCoords();
    this.circlesObj[circle.id] = circle;
};

CircleContainer.prototype.getXShift = function() {
    return this.glScene.xShift;
};

CircleContainer.prototype.draw = function(xDeltaShift) {
    if (xDeltaShift) {
        this.glScene.glSceneInit(xDeltaShift);
    }

    var circleArrTmp = [];
    for (var key in this.circlesObj) {
        circleArrTmp.push(helperUtils.clone(this.circlesObj[key])); 
    }

    var firstGrpIds = [];
    this._calculateSingleGrp(circleArrTmp, true, null, firstGrpIds);
    for (i = 0; i < firstGrpIds.length; i++) {
        var currCircleId = firstGrpIds[i];
        this.circlesObj[currCircleId].color = 'red';
    }

    for (var key in this.circlesObj) {
        var circle = this.circlesObj[key];
        this.glScene.drawObjects(circle);
    }
};

CircleContainer.prototype.toJSON = function() { 
    var resObj = {};
    for (var key in this.circlesObj) {
        var circle = this.circlesObj[key];
        resObj["circle" + i] = circle.vertexDataTyped;
    }
    return JSON.stringify(resObj);
}

CircleContainer.prototype._calculateSingleGrp = function(circleArr, firstCall, currGrpArr, grpIds) {
    if (firstCall) {
        currGrpArr = [];
        currGrpArr.push(circleArr[0]);
    }

    var hasElToAdd = false;
    for (var j = 0; j < currGrpArr.length; j++) {
        for (var k = 0; k < circleArr.length; k++) {
            var sqrtCircleXY = Math.sqrt(Math.pow(currGrpArr[j].xc - circleArr[k].xc, 2) + Math.pow(currGrpArr[j].yc - circleArr[k].yc, 2)); 
            if ((Math.abs(currGrpArr[j].circleR - circleArr[k].circleR) <= sqrtCircleXY) &&
                    (sqrtCircleXY <= (currGrpArr[j].circleR + circleArr[k].circleR))) {
                circleArr[k].toAddToCurrGrp = true;
                hasElToAdd = true;
            }
        }
    }
    
    if (!hasElToAdd) {
        if (currGrpArr.length > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    var j = 0;
    while (j < circleArr.length) { 
        if (circleArr[j].toAddToCurrGrp === true) {
            currGrpArr.push(circleArr[j]);
            if (grpIds) {
                grpIds.push(circleArr[j].id)
            }
            circleArr.splice(j, 1);
        } else {
            j++
        }
    }

    return this._calculateSingleGrp(circleArr, false, currGrpArr, grpIds);
}

CircleContainer.prototype.getNumCircleGrp = function() {
    var circleArrTmp = [];
    for (var key in this.circlesObj) {
        circleArrTmp.push(helperUtils.clone(this.circlesObj[key])); 
    }

    var grpCount = 0;
    while (circleArrTmp.length > 0) {
        grpCount += this._calculateSingleGrp(circleArrTmp, true);
    }

    return grpCount;   
};

CircleContainer.prototype.circleContainerInit = function() {
    this.circlesObj = {};
};
