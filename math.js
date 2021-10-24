function cartesian(angle, radius, c_x=wheelCenter_x, c_y=wheelCenter_y){
    return [c_x+Math.cos(angle)*radius, c_y-Math.sin(angle)*radius];
}
function polar(x,y, c_x=wheelCenter_x, c_y=wheelCenter_y){
    p_x = x-c_x;
    p_y = -(y-c_y);
    return [Math.atan2(p_y,p_x),Math.sqrt(p_x**2 + p_y**2)];
}



function road_height(x){
    var i = 0;
    while(i<road.length && road[i][0]<=x){
        i++;
    }
    i--;
    return road_canvas.height - ( road[i][1]+(x-road[i][0])*(road[i+1][1]-road[i][1])/(road[i+1][0]-road[i][0]) );
}
function radius(x){
    var i = 0;
    while(i<road.length && road[i][0]<=x){
        i++;
    }
    i--;
    return ( road[i][1]+(x-road[i][0])*(road[i+1][1]-road[i][1])/(road[i+1][0]-road[i][0]) ) - STD_CENTER;
}




function calculate_wheel(STEP_SIZE=2){
    var x = 0;
    var alpha = 0;
    var y = radius(x);
    // var y_prev = y;
    wheel_polar = [];
    while(alpha<2*Math.PI){
        wheel_polar = wheel_polar.concat([[alpha,y]]);
        x += STEP_SIZE;
        y = radius(x);
        // dy = y-y_prev;
        // dt = Math.sqrt(STEP_SIZE**2 + dt**2);
        alpha += Math.atan2(STEP_SIZE, y);
    }
    wheel_polar = wheel_polar.concat([ [2*Math.PI,wheel_polar[wheel_polar.length-1][1]] ]);
    road_pattern_length = x;
}


function calculate_cartesian(){
    wheel_cartesian = [];
    for(i=0; i<wheel_polar.length; i++){
        wheel_cartesian = wheel_cartesian.concat( [cartesian(wheel_polar[i][0], wheel_polar[i][1])] );
    }
}