function drawCircle(ctx, c_x,c_y, radius, colorFill, colorStroke){
    ctx.beginPath();
    ctx.arc(c_x, c_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
}
function centeredCircle(canvas, ctx, radius, colorFill, colorStroke){
    drawCircle(ctx, canvas.width/2, canvas.height/2, radius, colorFill, colorStroke)
}
function drawPath(canvas, ctx, points, colorFill, colorStroke, closePath=true, dottedPath=true){
    if(dottedPath){
        for(i=0; i<points.length; i++){
            var point = points[i];
            ctx.beginPath();
            ctx.arc(point[0],point[1], 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#005";
            ctx.fill(); 
        }
    }
    //start
    ctx.beginPath();
    ctx.moveTo(points[0][0],points[0][1]);
    //iterate
    for(i=1; i<points.length; i++){
        var point = points[i];
        ctx.lineTo(point[0],point[1]);
    }
    if(closePath){
        //close path
        ctx.lineTo(points[0][0],points[0][1]);
    }
    //fill & stroke
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
}

function redrawRoad(finish=true){
    road_ctx.clearRect(0, 0, road_canvas.width, road_canvas.height);
    drawPath(road_canvas, road_ctx, road, "#caffdd", "#96cfa6", finish);
    //drawPath(road_canvas, road_ctx, road, "#96ffaa", "#74ad83", finish);
}

