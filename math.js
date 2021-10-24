function cartesian(angle, radius, c_x, c_y){
    return [c_x+Math.cos(angle)*radius, c_y-Math.sin(angle)*radius];
}
function polar(x,y, c_x, c_y){
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
    return ( road[i][1]+(x-road[i][0])*(road[i+1][1]-road[i][1])/(road[i+1][0]-road[i][0]) ) - (road_canvas.height-STD_CENTER);
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
    road_pattern_end = (road_canvas.height-STD_CENTER) + radius(x);
}

function calculate_road_pattern(){
    var i = 0;
    road_pattern = [];
    while(i<road.length && road[i][0]<=road_pattern_length){
        i++;
    }
    road_pattern = road.slice(0,i).concat([[road_pattern_length,road_pattern_end],
                                           [road_pattern_length,road_canvas.height]]);
}

function calculate_demo_road(STEP_SIZE=2){
    demo_road = [[0,demo_canvas.height,0]];
    var x = 0;
    var alpha = 0;
    var j = 0;
    while(x+j*road_pattern_length < demo_canvas.width){
        demo_road = demo_road.concat([[x+j*road_pattern_length,demo_canvas.height-road_height(x),alpha]]);
        x += STEP_SIZE;
        alpha += Math.atan2(STEP_SIZE, radius(x));
        if(x >= road_pattern_length){
            x = 0;
            j++;
        }
    }
    demo_road = demo_road.concat([[x+j*road_pattern_length,demo_canvas.height-road_height(x),alpha],
                                  [demo_canvas.width,demo_canvas.height,alpha]]);
}



function calculate_demo_wheel(){
    var i=1;
    while(demo_road[i][0]<demo_wheel_x && i<demo_road.length-3){
        i++;
    }
    demo_wheel_y = demo_canvas.height-STD_CENTER;
    if(Math.abs(demo_road[i+1][2]-demo_road[i][2])>Math.PI){
        demo_wheel_angle = demo_road[i][2]+((demo_wheel_x-demo_road[i][0])*(demo_road[i+1][2]-demo_road[i][2]+2*Math.PI)/(demo_road[i+1][0]-demo_road[i][0]));
    } else{
        demo_wheel_angle = demo_road[i][2]+((demo_wheel_x-demo_road[i][0])*(demo_road[i+1][2]-demo_road[i][2])/(demo_road[i+1][0]-demo_road[i][0]));
    }
    //demo_wheel_angle = demo_road[i][2];
    demo_wheel = [];
    for(var j=0; j<wheel_polar.length; j++){
        var a = wheel_polar[j][0]-demo_wheel_angle-Math.PI/2;
        var r = wheel_polar[j][1];
        demo_wheel = demo_wheel.concat([ cartesian(a, r, c_x=demo_wheel_x, c_y=demo_wheel_y) ]);
    }
}


// function calculate_demo_wheel(){
//     demo_wheel_angle = 0;


//     demo_wheel = [];
//     for(i=0; i<wheel_polar.length; i++){
//         demo_wheel = demo_wheel.concat( [cartesian(wheel_polar[i][0], wheel_polar[i][1], demo_wheel_x,demo_wheel_y)] );
//     }
// }



