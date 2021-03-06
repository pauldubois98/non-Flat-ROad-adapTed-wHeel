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

function local_collision(UPDATE_ICON=true){
    local_collision_points_indexes = [];
    var i=2;
    while(road[i+1][0]<=road_pattern_length){
        j = i-1;
        k = i+1;
        var A = Math.sqrt( ((road[i][0]-road[j][0])**2) 
                         + ((road[i][1]-road[j][1])**2) );
        var B = Math.sqrt( ((road[i][0]-road[k][0])**2) 
                         + ((road[i][1]-road[k][1])**2) );
        var C = Math.sqrt( ((road[k][0]-road[j][0])**2) 
                         + ((road[k][1]-road[j][1])**2) );
        // C**2 = A**2 + B**2 - 2*A*C*cos(angle_C)
        var angle_C = Math.acos( ( (A**2) + (B**2) - (C**2) ) / (2*A*B) );
        if(C<Math.sqrt((A**2) + (B**2))){
            local_collision_points_indexes = local_collision_points_indexes.concat([i]);
        }
        i++;
    }
    // last check has to be done differently
    if(Math.abs( (road_canvas.height-road_height(road_pattern_length)) - road[1][1] ) > 1){
        if( (road_canvas.height-road_height(road_pattern_length)) < road[1][1]){
            // Need a negative slope at the beginning & at the end
            if(road[1][1]>road[2][1] || road[i][1]>(road_canvas.height-road_height(road_pattern_length))){
                local_collision_points_indexes = local_collision_points_indexes.concat([1]);
            }
            // console.log("neg",i)
        } else{
            // Need a positive slope at the beginning & at the end
            if(road[1][1]<road[2][1] || road[i][1]<(road_canvas.height-road_height(road_pattern_length))){
                local_collision_points_indexes = local_collision_points_indexes.concat([1]);
            }
            // console.log("pos",i)
        }
    } else{
        // console.log("snapped",i)
        var j=i-1;
        var k=2;
        var A = Math.sqrt( ((road_pattern_length-road[j][0])**2) 
                         + (((road_canvas.height-road_height(road_pattern_length))-road[j][1])**2) );
        var B = Math.sqrt( ((road_pattern_length-(road_pattern_length+road[k][0]))**2) 
                         + (((road_canvas.height-road_height(road_pattern_length))-road[k][1])**2) );
        var C = Math.sqrt( (((road_pattern_length+road[k][0])-road[j][0])**2) 
                         + ((road[k][1]-road[j][1])**2) );
        if(C<Math.sqrt((A**2) + (B**2))){
            local_collision_points_indexes = local_collision_points_indexes.concat([i]);
        }
    }
    local_collision_points_indexes = local_collision_points_indexes.sort();
    if(UPDATE_ICON){
        if(local_collision_points_indexes.length != 0){
            local_collision_icon.src="svg/local_red_24dp.svg"
        } else{
            local_collision_icon.src="svg/local_green_24dp.svg"
        }
    }
    return local_collision_points_indexes.length != 0;
}
function global_collision(TOL_ANGLE=Math.PI/6, UPDATE_ICON=true){
    global_collision_points_indexes = []
    if(demo_road!=undefined){
        var i = 0;
        var x = 0;
        while(x<road_pattern_length){
            x = demo_road[i][0];
            for(var j=0; j<wheel_polar.length; j++){
                var an = (wheel_polar[j][0]-demo_road[i][2]+(3.5*Math.PI))%(2*Math.PI);
                if( an < 1.5*Math.PI - TOL_ANGLE || an > 1.5*Math.PI + TOL_ANGLE){
                    var r = wheel_polar[j][1];
                    var wheel_y = demo_canvas.height-STD_CENTER-Math.sin(an)*r;
                    var road_x = (x+Math.cos(an)*r + road_pattern_length)%road_pattern_length;
                    var road_y = demo_canvas.height - road_height(road_x);
                    if(wheel_y > road_y){
                        global_collision_points_indexes = global_collision_points_indexes.concat([[i,j,an]]);
                        // // For debug:
                        // demo_ctx.beginPath();
                        // demo_ctx.moveTo(x,STD_CENTER);
                        // // demo_ctx.lineTo(road_x,road_y);
                        // demo_ctx.lineTo(road_x,wheel_y);
                        // demo_ctx.strokeStyle = "#000";
                        // demo_ctx.stroke();
                    }
                }
            }
            i++;
        }
    }
    if(UPDATE_ICON){
        if(global_collision_points_indexes.length != 0){
            global_collision_icon.src="svg/global_red_24dp.svg"
        } else{
            global_collision_icon.src="svg/global_green_24dp.svg"
        }
    }
    return global_collision_points_indexes.length != 0;
}
function collision(TOL_ANGLE=Math.PI/6, UPDATE_ICON=true){
    var collision = (local_collision_points_indexes.length != 0) || (global_collision_points_indexes.length != 0)
    if(UPDATE_ICON){
        if(collision){
            collision_icon.src="svg/collision_red_24dp.svg"
        } else{
            collision_icon.src="svg/collision_green_24dp.svg"
        }
    }
    return collision
}

function calculate_wheel(STEP_SIZE=2){
    road = road.sort(function (a,b){return a[0]-b[0]});
    var x = 0;
    var alpha = 0;
    var y = radius(x);
    // var y_prev = y;
    wheel_polar = [];
    while(alpha<2*Math.PI && x<road_canvas.width-STEP_SIZE){
        wheel_polar = wheel_polar.concat([[alpha,y]]);
        x += STEP_SIZE;
        y = radius(x);
        // dy = y-y_prev;
        // y_prev = y;
        // dt = Math.sqrt(STEP_SIZE**2 + dt**2);
        alpha += Math.atan2(STEP_SIZE, y);
    }
    if(x>=road_canvas.width-STEP_SIZE){
        window.alert("The pattern will not fit in the canvas.");
        road = [[0,road_canvas.height],
            [0,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height]];
        ROAD_DRAWING=false;
        ROAD_EDITING=true;
        edit_road_btn.innerHTML = "<img src=\"svg/gesture_black_24dp.svg\" class=\"icon\"> Edit ON";
        calculate_and_draw();
    } else{
        x -= STEP_SIZE;
        x += (2*Math.PI-wheel_polar[wheel_polar.length-1][0]) * STEP_SIZE / (alpha-wheel_polar[wheel_polar.length-1][0]);
        y = radius(x);
        wheel_polar = wheel_polar.concat([ [2*Math.PI,y] ]);
        // wheel_polar = wheel_polar.concat([ [2*Math.PI,wheel_polar[wheel_polar.length-1][1]] ]);
        road_pattern_length = x;
        road_pattern_end = (road_canvas.height-STD_CENTER) + radius(x);
    }
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
            x -= road_pattern_length;
            j++;
            alpha = 0;
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
function calculate_demo_bis(){
    // finding start
    while(demo_bis_x<0){
        demo_bis_x += road_pattern_length;
    }
    while(demo_bis_x>=road_pattern_length){
        demo_bis_x -= road_pattern_length;
    }
    i = 0;
    while(demo_road[i][0]<demo_bis_x){
        i++;
    }
    if(i>0){
        i--;
    }
    // road
    var x = demo_road[i][0]-demo_bis_x;
    var prev = demo_road[i][0];
    demo_road_bis = [[0,demo_canvas_bis.height,0]];
    while(x<=demo_canvas_bis.width){
        demo_road_bis = demo_road_bis.concat([[x,demo_road[i][1],demo_road[i][2]]]);
        i++;
        x += (demo_road[i][0]-prev);
        prev = demo_road[i][0];
        if(demo_road[i][0]>=road_pattern_length){
            prev = 0
            x -= demo_road[i][0]-road_pattern_length;
            i=1;
        }
    }
    demo_road_bis = demo_road_bis.concat([[x,demo_road[i][1],demo_road[i][2]]]);
    demo_road_bis = demo_road_bis.concat([[demo_canvas_bis.width,demo_canvas_bis.height,0]]);
    // wheel
    var i=1;
    while(demo_road_bis[i][0]<demo_wheel_bis_x && i<demo_road_bis.length-3){
        i++;
    }
    demo_wheel_bis_y = demo_canvas.height-STD_CENTER;
    if(Math.abs(demo_road_bis[i+1][2]-demo_road_bis[i][2])>Math.PI){
        demo_wheel_bis_angle = demo_road_bis[i][2]+((demo_wheel_bis_x-demo_road_bis[i][0])*(demo_road_bis[i+1][2]-demo_road_bis[i][2]+2*Math.PI)/(demo_road_bis[i+1][0]-demo_road_bis[i][0]));
    } else{
        demo_wheel_bis_angle = demo_road_bis[i][2]+((demo_wheel_bis_x-demo_road_bis[i][0])*(demo_road_bis[i+1][2]-demo_road_bis[i][2])/(demo_road_bis[i+1][0]-demo_road_bis[i][0]));
    }
    //demo_wheel_bis_angle = demo_road_bis[i][2];
    demo_wheel_bis = [];
    for(var j=0; j<wheel_polar.length; j++){
        var a = wheel_polar[j][0]-demo_wheel_bis_angle-Math.PI/2;
        var r = wheel_polar[j][1];
        demo_wheel_bis = demo_wheel_bis.concat([ cartesian(a, r, c_x=demo_wheel_bis_x, c_y=demo_wheel_bis_y) ]);
    }
}



function snap_road(){
    var last_point_index=0;
    while(road[last_point_index][0]<=road_pattern_length){
        last_point_index++;
    }
    last_point_index--;
    var last_point_x = road[last_point_index][0];
    var last_point_y = road[last_point_index][1];
    var last_point_radius = last_point_y  - (road_canvas.height-STD_CENTER);
    var last_point_angle = 0;
    var i=0;
    while(demo_road[i][0]<=last_point_x){
        i++;
    }
    i--;
    if(Math.abs(demo_road[i+1][2]-demo_road[i][2])>Math.PI){
        last_point_angle = demo_road[i][2]+((last_point_x-demo_road[i][0])*(demo_road[i+1][2]-demo_road[i][2]+2*Math.PI)/(demo_road[i+1][0]-demo_road[i][0]));
    } else{
        last_point_angle = demo_road[i][2]+((last_point_x-demo_road[i][0])*(demo_road[i+1][2]-demo_road[i][2])/(demo_road[i+1][0]-demo_road[i][0]));
    }
    var remaining_angle = 2*Math.PI - last_point_angle;
    var end_y = road[1][1];
    var end_radius = end_y - (road_canvas.height-STD_CENTER);
    if(remaining_angle>0.1 && Math.abs(last_point_y-end_y)>1){
        // // EXACT SOLVING
        var a = (1/remaining_angle)*Math.log(end_radius/last_point_radius);
        var end_x = last_point_x + ((end_radius-last_point_radius)/a);
        if(isNaN(end_x)){
            window.alert("Calculation Error.");
        } else if(end_x>=road_canvas.width){
            window.alert("The pattern will not fit in the canvas.");
        } else{
            i=0;
            var new_road = []
            while(i<road.length){
                if(road[i][0]<=last_point_x || road[i][0]>=end_x){
                    new_road = new_road.concat([road[i]]);
                }
                i++;
            }
            road = new_road.concat([[end_x,end_y]]);
        }
        // //INEXACT SOLVING
        // var start_x = last_point_x;
        // var start_y = last_point_y;
        // var min_end_x = last_point_x;
        // var max_end_x = road[last_point_index+1][0];
        // var EPSILON=0.001;
        // var STEP_SIZE=2;
        // while(max_end_x-min_end_x > EPSILON){
        //     var end_x = (min_end_x+max_end_x)/2;
        //     var x = start_x;
        //     var alpha = 0;
        //     while(alpha<remaining_angle && x<end_x){
        //         x += STEP_SIZE;
        //         y = ( start_y+ ((x-start_x)*(end_y-start_y)/(end_x-start_x)) ) - (road_canvas.height-STD_CENTER);
        //         alpha += Math.atan2(STEP_SIZE, y);
        //     }
        //     if(x<=end_x){
        //         max_end_x = end_x;
        //     } else{
        //         min_end_x = end_x;
        //     }
        // }
        // var end_x = (a+b)/2;
        // road = road.concat([[end_x,end_y]])
    } // (else ignore)
}
function check(n, integer=true, positive=true, maxi=true, maxi_val=20){
    if(positive && n<=0){
        return 1;
    }
    if(maxi && n>maxi_val){
        return maxi_val;
    }
    if(integer && n!=Math.round(n)){
        return Math.round(n);
    }
    return n;
}