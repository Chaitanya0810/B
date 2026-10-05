// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function AnimatedBTreeNode(id, widthPerElem, h, numElems, fillColor, edgeColor, isLeaf) {
    fillColor = (fillColor == undefined) ? "#FFFFFF" : fillColor;
    edgeColor = (edgeColor == undefined) ? "#000000" : edgeColor;
    this.init(id, widthPerElem, h, numElems, fillColor, edgeColor, isLeaf);
}

AnimatedBTreeNode.prototype = new AnimatedObject();
AnimatedBTreeNode.prototype.constructor = AnimatedBTreeNode;
AnimatedBTreeNode.superclass = AnimatedObject.prototype;

AnimatedBTreeNode.MIN_WIDTH = 10;
AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT = 5;


AnimatedBTreeNode.prototype.init = function (id, widthPerElem, h, numElems, fillColor, edgeColor, isLeaf) {

    var MIN_WIDTH = 10;
    AnimatedBTreeNode.superclass.init.call(this);
    this.objectID = id;


    this.backgroundColor = fillColor;
    this.foregroundColor = edgeColor;
    this.isLeaf = (isLeaf === undefined) ? true : !!isLeaf;

    this.widthPerElement = widthPerElem;
    this.nodeHeight = h;
    this.numLabels = numElems;
    this.labels = new Array(this.numLabels);
    this.labelColors = new Array(this.numLabels);
    for (var i = 0; i < this.numLabels; i++) {
        this.labelColors[i] = this.foregroundColor;
    }
}

AnimatedBTreeNode.prototype.getNumElements = function () {
    return this.numLabels;
}

AnimatedBTreeNode.prototype.getWidth = function () {
    if (this.numLabels > 0) {
        return (this.widthPerElement * this.numLabels);
    }
    else {
        return AnimatedBTreeNode.MIN_WIDTH;
    }
}


AnimatedBTreeNode.prototype.setNumElements = function (newNumElements) {
    var i;
    if (this.numLabels < newNumElements) {
        for (i = this.numLabels; i < newNumElements; i++) {
            this.labels[i] = "";
            this.labelColors[i] = this.foregroundColor;
        }
        this.numLabels = newNumElements;
    }
    else if (this.numLabels > newNumElements) {
        for (i = newNumElements; i < this.numLabels; i++) {
            this.labels[i] = null;
        }
        this.numLabels = newNumElements;
    }
}


AnimatedBTreeNode.prototype.left = function () {
    return this.x - this.getWidth() / 2.0;
}

AnimatedBTreeNode.prototype.right = function () {
    return this.x + this.getWidth() / 2.0;
}

AnimatedBTreeNode.prototype.top = function () {
    return this.y - this.nodeHeight / 2.0;
}

AnimatedBTreeNode.prototype.bottom = function () {
    return this.y + this.nodeHeight / 2.0;
}


AnimatedBTreeNode.prototype.draw = function (context) {
    var startX = this.left();
    var startY = this.top();
    var width = this.getWidth();
    var centerX = this.x;
    var centerY = this.y;

    function traceShape(ctx, x, y, w, h) {
        ctx.beginPath();
        var radius = 5;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    context.save();
    if (this.highlighted) {
        context.save();
        context.shadowColor = "rgba(200, 139, 75, .72)";
        context.shadowBlur = 11 + this.highlightDiff * 1.5;
        context.lineWidth = 2 + this.highlightDiff * .18;
        context.strokeStyle = "#D39350";
        traceShape(context, startX - 2, startY - 2, width + 4, this.nodeHeight + 4);
        context.stroke();
        context.restore();
    }

    context.shadowColor = this.isLeaf ? "rgba(41, 70, 43, .20)" : "rgba(27, 53, 38, .28)";
    context.shadowBlur = 8;
    context.shadowOffsetY = 3;
    context.fillStyle = this.backgroundColor;
    context.strokeStyle = this.foregroundColor;
    context.lineWidth = 1.6;
    traceShape(context, startX, startY, width, this.nodeHeight);
    context.fill();
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.stroke();

    // Page header separates node metadata from its key/pointer slots.
    context.save();
    context.globalAlpha = .16;
    context.strokeStyle = this.foregroundColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(startX + 1, startY + 12);
    context.lineTo(startX + width - 1, startY + 12);
    context.stroke();
    context.globalAlpha = .20;
    for (var divider = 1; divider < this.numLabels; divider++) {
        var dividerX = startX + divider * this.widthPerElement;
        context.beginPath();
        context.moveTo(dividerX, startY + 12);
        context.lineTo(dividerX, startY + this.nodeHeight - 9);
        context.stroke();
    }

    if (!this.isLeaf) {
        // One child-pointer port sits before, between, and after the separator keys.
        context.globalAlpha = .72;
        for (var port = 0; port <= this.numLabels; port++) {
            var portX = startX + port * this.widthPerElement;
            context.beginPath();
            context.moveTo(portX, startY + this.nodeHeight - 7);
            context.lineTo(portX, startY + this.nodeHeight - 1);
            context.stroke();
            context.beginPath();
            context.arc(portX, startY + this.nodeHeight - 6, 2.1, 0, Math.PI * 2);
            context.fillStyle = this.foregroundColor;
            context.fill();
        }
    } else {
        // Leaf entries pair each key with a conceptual row identifier.
        context.globalAlpha = .30;
        context.font = '700 6px ui-sans-serif, system-ui, sans-serif';
        context.textAlign = 'center';
        for (var record = 0; record < this.numLabels; record++) {
            var recordX = startX + record * this.widthPerElement + this.widthPerElement / 2;
            context.fillStyle = this.foregroundColor;
            var fileTag = window.getIndexedFileTagForKey ? window.getIndexedFileTagForKey(this.labels[record]) : null;
            context.fillText(fileTag || 'FILE', recordX, startY + this.nodeHeight - 5);
        }
    }
    context.restore();

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '700 6px ui-sans-serif, system-ui, sans-serif';
    context.fillStyle = this.foregroundColor;
    context.globalAlpha = .68;
    var pageNumber = ('0000' + this.objectID).slice(-4);
    context.fillText((this.isLeaf ? 'LEAF' : 'INDEX') + '  /  PAGE ' + pageNumber, centerX, startY + 5);
    context.globalAlpha = 1;
    context.font = '700 14px Georgia, "Times New Roman", serif';
    for (var i = 0; i < this.numLabels; i++) {
        var labelx = this.x - this.widthPerElement * this.numLabels / 2 + this.widthPerElement / 2 + i * this.widthPerElement;
        context.fillStyle = this.labelColors[i];
        context.fillText(this.labels[i], labelx, centerY + 1);
    }
    context.restore();
}


AnimatedBTreeNode.prototype.getHeight = function () {
    return this.nodeHeight;
}


AnimatedBTreeNode.prototype.setForegroundColor = function (newColor) {
    this.foregroundColor = newColor;
    for (var i = 0; i < numLabels; i++) {
        labelColor[i] = newColor;
    }
}


// TODO:  Kill the magic numbers here
AnimatedBTreeNode.prototype.getTailPointerAttachPos = function (fromX, fromY, anchor) {
    if (anchor == 0) {
        return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
    }
    else if (anchor == this.numLabels) {
        return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
    }
    else {
        return [this.left() + anchor * this.widthPerElement, this.y]
    }
}

AnimatedBTreeNode.prototype.getChildPointerAttachPos = function (childIndex) {
    childIndex = Math.max(0, Math.min(this.numLabels, childIndex || 0));
    return [this.left() + childIndex * this.widthPerElement, this.bottom()];
}

AnimatedBTreeNode.prototype.getLeafLinkAttachPos = function (anchor) {
    anchor = Math.max(0, Math.min(this.numLabels, anchor || 0));
    return [this.left() + anchor * this.widthPerElement, this.bottom() - 2];
}


AnimatedBTreeNode.prototype.getHeadPointerAttachPos = function (fromX, fromY) {
    if (fromY < this.y - this.nodeHeight / 2) {
        return [this.x, this.y - this.nodeHeight / 2];
    }
    else if (this.fromY > this.y + this.nodeHeight / 2) {
        return [this.x, this.y + this.nodeHeight / 2];
    }
    else if (fromX < this.x - this.getWidth() / 2) {
        return [this.x - this.getWidth() / 2, this.y];
    }
    else {
        return [this.x + this.getWidth() / 2, this.y];
    }
}


AnimatedBTreeNode.prototype.createUndoDelete = function () {
    return new UndoDeleteBTreeNode(this.objectID, this.numLabels, this.labels, this.x, this.y, this.widthPerElement, this.nodeHeight, this.labelColors, this.backgroundColor, this.foregroundColor, this.layer, this.highlighted, this.isLeaf);
}


AnimatedBTreeNode.prototype.getTextColor = function (textIndex) {
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    return this.labelColors[textIndex];
}

AnimatedBTreeNode.prototype.getText = function (index) {
    index = (index == undefined) ? 0 : index;
    return this.labels[index];
}

AnimatedBTreeNode.prototype.setTextColor = function (color, textIndex) {
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    this.labelColors[textIndex] = color;
}


AnimatedBTreeNode.prototype.setText = function (newText, textIndex) {
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    this.labels[textIndex] = newText;
}


function UndoDeleteBTreeNode(id, numLab, labelText, x, y, wPerElement, nHeight, lColors, bgColor, fgColor, l, highlighted, isLeaf) {
    this.objectID = id;
    this.posX = x;
    this.posY = y;
    this.widthPerElem = wPerElement;
    this.nodeHeight = nHeight;
    this.backgroundColor = bgColor;
    this.foregroundColor = fgColor;
    this.numElems = numLab;
    this.labels = labelText;

    this.labelColors = lColors;
    this.layer = l;
    this.highlighted = highlighted;
    this.isLeaf = isLeaf;
}

UndoDeleteBTreeNode.prototype = new UndoBlock();
UndoDeleteBTreeNode.prototype.constructor = UndoDeleteBTreeNode;

UndoDeleteBTreeNode.prototype.undoInitialStep = function (world) {

    world.addBTreeNode(this.objectID, this.widthPerElem, this.nodeHeight, this.numElems, this.backgroundColor, this.foregroundColor, this.isLeaf);
    world.setNodePosition(this.objectID, this.posX, this.posY);
    for (var i = 0; i < this.numElems; i++) {
        world.setText(this.objectID, this.labels[i], i);
        world.setTextColor(this.objectID, this.labelColors[i], i);
    }
    world.setHighlight(this.objectID, this.highlighted);
    world.setLayer(this.objectID, this.layer);
}



