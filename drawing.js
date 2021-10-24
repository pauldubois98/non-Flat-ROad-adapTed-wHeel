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

function redrawRoad(){
    road_ctx.clearRect(0, 0, road_canvas.width, road_canvas.height);
    drawPath(road_canvas, road_ctx, [[0,road_canvas.height-STD_CENTER],
                                     [road_canvas.width,road_canvas.height-STD_CENTER]], "#f000", "#f00", false,false);
    drawPath(road_canvas, road_ctx, road, "#CAFFDD", "#96CFA6", true);
    drawPath(road_canvas, road_ctx, road_pattern, "#96FFAA", "#74AD83", true, false);
    //drawPath(road_canvas, road_ctx, road, "#96ffaa", "#74ad83", finish);
}
function redrawDemo(){
    demo_ctx.clearRect(0, 0, demo_canvas.width, demo_canvas.height);
    //drawPath(road_canvas, road_ctx, road, "#caffdd", "#96cfa6", finish);
    drawPath(demo_canvas, demo_ctx, demo_road, "#96FFAA", "#74AD83", true, false);
    drawPath(demo_canvas, demo_ctx, demo_wheel, "#61D8FF", "#309488", true,false);
    drawCircle(demo_ctx, demo_wheel_x,demo_wheel_y, 1, "#000", "#000")
}
function redrawDemoBis(){
    demo_ctx_bis.clearRect(0, 0, demo_canvas_bis.width, demo_canvas_bis.height);
    drawPath(demo_canvas_bis, demo_ctx_bis, demo_road_bis, "#96FFAA", "#438855", true, false);
    drawPath(demo_canvas_bis, demo_ctx_bis, demo_wheel_bis, "#61D8FF", "#309488", true, false);
    drawCircle(demo_ctx_bis, demo_wheel_bis_x,demo_wheel_bis_y, 1, "#000", "#000")
}
