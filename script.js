var road_canvas = document.getElementById("road_canvas");
var road_ctx = road_canvas.getContext('2d');
var roadLeft = road_canvas.offsetLeft + road_canvas.clientLeft;
var roadTop = road_canvas.offsetTop + road_canvas.clientTop;

var demo_canvas = document.getElementById("demo_canvas");
var demo_ctx = demo_canvas.getContext('2d');
var demoLeft = demo_canvas.offsetLeft + demo_canvas.clientLeft;
var demoTop = demo_canvas.offsetTop + demo_canvas.clientTop;

var demo_canvas_bis = document.getElementById("demo_canvas_bis");
var demo_ctx_bis = demo_canvas_bis.getContext('2d');
var demoLeft_bis = demo_canvas_bis.offsetLeft + demo_canvas_bis.clientLeft;
var demoTop_bis = demo_canvas_bis.offsetTop + demo_canvas_bis.clientTop;

var new_road_btn = document.getElementById("new_road_btn");
var edit_road_btn = document.getElementById("edit_road_btn");

var draw_spikes_btn = document.getElementById("draw_spikes_btn");
var number_spikes_input = document.getElementById("number_spikes");
var draw_square_btn = document.getElementById("draw_square_btn");
var number_squares_input = document.getElementById("number_squares");
var draw_sine_btn = document.getElementById("draw_sine_btn");
var number_sine_input = document.getElementById("number_sine");
var snap_btn = document.getElementById("snap_btn");
var local_collision_btn = document.getElementById("local_collision_btn");
var local_collision_icon = document.getElementById("local_collision_icon");
var global_collision_btn = document.getElementById("global_collision_btn");
var global_collision_icon = document.getElementById("global_collision_icon");

const STD_HEIGHT = 55;
const STD_CENTER = 155;
const STD_RADIUS = STD_CENTER-STD_HEIGHT;
var ROAD_EDITING = true;
var ROAD_EDITING_ON = false;
var road = [[0,road_canvas.height],
            [0,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height]];
var road_pattern = [[0,road_canvas.height],
                    [0,road_canvas.height-STD_HEIGHT],
                    [road_canvas.width,road_canvas.height-STD_HEIGHT],
                    [road_canvas.width,road_canvas.height]];
var editing_start_x = 0;
var editing_start_y = 0;
var editing_point_index = 0;

var road_pattern_length = road_canvas.width;
var road_pattern_end = road_canvas.height-STD_HEIGHT;
var wheel_polar = [];

var DEMO_MOUSE_DOWN = false;
var demo_wheel = [];
var demo_wheel_x = demo_canvas.width/2;
var demo_wheel_y = demo_canvas.height/2;
var demo_wheel_angle = 0;
var demo_road = [];

var demo_bis_x = 0;
var demo_road_bis = 0;
var demo_wheel_bis = 0;
var demo_wheel_bis_x = demo_canvas.width/2;
var demo_wheel_bis_y = 0;
var demo_wheel_bis_angle = 0;
var DEMO_MOUSE_DOWN_BIS = false;
var DEMO_MOUSE_DOWN_BIS_X = 0;

var local_collision_points_indexes = [];
var global_collision_points_indexes = [];


demo_canvas.addEventListener('mousedown', function(event) {
    DEMO_MOUSE_DOWN = true;
    demo_wheel_x = event.pageX-demoLeft;
    calculate_demo_wheel();
    redrawDemo();
});
demo_canvas.addEventListener('mousemove', function(event) {
    if(DEMO_MOUSE_DOWN){
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});
demo_canvas.addEventListener('mouseup', function(event) {
    if(DEMO_MOUSE_DOWN){
        DEMO_MOUSE_DOWN = false;
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});
demo_canvas.addEventListener('mouseleave', function(event) {
    if(DEMO_MOUSE_DOWN){
        DEMO_MOUSE_DOWN = false;
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});

demo_canvas_bis.addEventListener('mousedown', function(event) {
    DEMO_MOUSE_DOWN_BIS = true;
    DEMO_MOUSE_DOWN_BIS_X = event.pageX-demoLeft_bis;
    calculate_demo_bis();
    redrawDemoBis();
});
demo_canvas_bis.addEventListener('mousemove', function(event) {
    if(DEMO_MOUSE_DOWN_BIS){
        demo_bis_x -= (event.pageX-demoLeft_bis)-DEMO_MOUSE_DOWN_BIS_X;
        DEMO_MOUSE_DOWN_BIS_X = event.pageX-demoLeft_bis;
        calculate_demo_bis();
        redrawDemoBis();
    }
});
demo_canvas_bis.addEventListener('mouseup', function(event) {
    if(DEMO_MOUSE_DOWN_BIS){
        DEMO_MOUSE_DOWN_BIS = false;
        demo_bis_x -= (event.pageX-demoLeft)-DEMO_MOUSE_DOWN_BIS_X;
        calculate_demo_bis();
        redrawDemoBis();
    }
});
demo_canvas_bis.addEventListener('mouseleave', function(event) {
    if(DEMO_MOUSE_DOWN_BIS){
        DEMO_MOUSE_DOWN_BIS = false;
        demo_bis_x -= (event.pageX-demoLeft)-DEMO_MOUSE_DOWN_BIS_X;
        calculate_demo_bis();
        redrawDemoBis();
    }
});

road_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-roadLeft;
    var y = event.pageY-roadTop;
    if(ROAD_EDITING){
        editing_point_index = -1;
        for(i=0; i<road.length; i++){
            var pt = road[i];
            var dist = Math.sqrt( (x-pt[0])**2 + (y-pt[1])**2 );
            if(dist<10 && editing_point_index==-1){
                editing_point_index = -2;
            }
            if(dist<5){
                editing_point_index = i;
            }
        }
        if(editing_point_index==0 || editing_point_index==road.length-1){
            editing_point_index = -1;
        }
        if(event.button == 0 && editing_point_index>=0){
            ROAD_EDITING_ON = true;
            editing_start_x = x;
            editing_start_y = y;
            drawCircle(road_ctx,
                road[editing_point_index][0],
                road[editing_point_index][1], 5, "#FFF0", "#F00");
        }
        if(event.button == 2 && editing_point_index>=0
            && editing_point_index!=road.length-2
            && editing_point_index!=1 ){
                road = road.slice(0,editing_point_index).concat(road.slice(editing_point_index+1));
            }
        if(event.button == 2 && editing_point_index==-1){
            var i = 0;
            while(i<road.length && road[i][0]<=x){
                i++;
            }
            road.splice(i,0, [x, y] );
        }
        calculate_and_draw();
    };
    
});
road_canvas.addEventListener('mousemove', function(event) {
    if(ROAD_EDITING_ON){
        if(road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x>0 &&
           road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x<road_canvas.width &&
           editing_point_index!=1 && editing_point_index!=road.length-2){
            road[editing_point_index][0] += event.pageX-roadLeft-editing_start_x;
            editing_start_x = event.pageX-roadLeft;
        }
        if(road[editing_point_index][1]+event.pageY-roadTop-editing_start_y>road_canvas.height-STD_CENTER){
            road[editing_point_index][1] += event.pageY-roadTop-editing_start_y;
            editing_start_y = event.pageY-roadTop;
        }
        redrawRoad();
        drawCircle(road_ctx,
            road[editing_point_index][0],
            road[editing_point_index][1], 5, "#FFF0", "#F00");
    };
});
road_canvas.addEventListener('mouseleave', function(event) {
    if(ROAD_EDITING_ON){
        ROAD_EDITING_ON = false;
        calculate_and_draw();
    };
});
road_canvas.addEventListener('mouseup', function(event) {
    if(ROAD_EDITING_ON){
        ROAD_EDITING_ON = false;
        calculate_and_draw();
    };
});
road_canvas.oncontextmenu = function(e){
    e.preventDefault();
    e.stopPropagation();
}

new_road_btn.addEventListener('click', function(event){
    road = [[0,road_canvas.height],
            [0,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height-STD_HEIGHT],
            [road_canvas.width,road_canvas.height]];
    ROAD_EDITING=true;
    edit_road_btn.innerHTML = "<img src=\"svg/gesture_black_24dp.svg\" class=\"icon\"> Edit ON";
    calculate_and_draw();
});
edit_road_btn.addEventListener('click', function(event){
    ROAD_DRAWING=false;
    if (ROAD_EDITING){
        ROAD_EDITING=false;
        edit_road_btn.innerHTML = "<img src=\"svg/no_gesture_black_24dp.svg\" class=\"icon\"> Edit OFF";
    } else{
        ROAD_EDITING=true;
        edit_road_btn.innerHTML = "<img src=\"svg/gesture_black_24dp.svg\" class=\"icon\"> Edit ON";
    };
    calculate_and_draw();
});
snap_btn.addEventListener('click', function(event){
    calculate_wheel();
    calculate_road_pattern();
    calculate_demo_road();
    snap_road();
    calculate_and_draw();
});
draw_spikes_btn.addEventListener('click', function(event){
    var AMPLITUDE = 20;
    var R1 = STD_RADIUS+AMPLITUDE;
    var R2 = STD_RADIUS-AMPLITUDE;
    var n = number_spikes_input.value;
    n = check(n);
    number_spikes_input.value = n;
    road = [[0,road_canvas.height]];
    var L = (R1-R2)/(Math.log(R1/R2)*(2*n/Math.PI))
    for(var i=0; i<n; i++){

        road = road.concat([[ i*4*L, road_canvas.height-STD_CENTER + STD_RADIUS],
                            [ (i*4+1)*L, road_canvas.height-STD_CENTER + R1],
                            [ (i*4+2)*L, road_canvas.height-STD_CENTER + STD_RADIUS],
                            [ (i*4+3)*L, road_canvas.height-STD_CENTER + R2]]);
    }
    road = road.concat([[ 4*n*L, road_canvas.height-STD_CENTER + STD_RADIUS],
                        [road_canvas.width,road_canvas.height-STD_HEIGHT],
                        [road_canvas.width,road_canvas.height]]);
    calculate_and_draw();
});
draw_square_btn.addEventListener('click', function(event){
    var AMPLITUDE = 20;
    var R1 = STD_RADIUS+AMPLITUDE;
    var R2 = STD_RADIUS-AMPLITUDE;
    var n = number_squares_input.value;
    n = check(n);
    number_squares_input.value = n
    road = [[0,road_canvas.height]];
    for(var i=0; i<n; i++){
        road = road.concat([[ (i*2*Math.PI*R1/(2*n))+ (i*2*Math.PI*R2/(2*n)), road_canvas.height-STD_CENTER + R1],
                            [ ((i+1)*2*Math.PI*R1/(2*n)) + (i*2*Math.PI*R2/(2*n)), road_canvas.height-STD_CENTER + R1],
                            [ ((i+1)*2*Math.PI*R1/(2*n)) + (i*2*Math.PI*R2/(2*n)), road_canvas.height-STD_CENTER + R2],
                            [ ((i+1)*2*Math.PI*R1/(2*n)) + ((i+1)*2*Math.PI*R2/(2*n)), road_canvas.height-STD_CENTER + R2]]);
    }
    road = road.concat([[ (Math.PI*R1) + (Math.PI*R2) + 1, road_canvas.height-STD_HEIGHT],
                        [road_canvas.width,road_canvas.height-STD_HEIGHT],
                        [road_canvas.width,road_canvas.height]]);
    calculate_and_draw();
});
draw_sine_btn.addEventListener('click', function(event){
    var AMPLITUDE = 20;
    var STEP_SIZE = 5;
    var n = number_sine_input.value;
    n = check(n, false);
    number_sine_input.value = n;
    var D = Math.sqrt( (STD_RADIUS**2) + (AMPLITUDE**2) );
    // because road isn't a perfect sine curve (we use a piecewise linear approximation),
    // we need to adjust the value of D:
    D = D*0.96;
    var a = n/D;
    road = [[0,road_canvas.height]];
    var x = 0;
    while(x<=2*Math.PI*D){
        road = road.concat([[x, road_canvas.height-STD_CENTER + STD_RADIUS-(AMPLITUDE*Math.sin(a*x)) ]]);
        x += STEP_SIZE;
    }
    road = road.concat([[2*Math.PI*D + STEP_SIZE, road_canvas.height-STD_HEIGHT],
                        [road_canvas.width,road_canvas.height-STD_HEIGHT],
                        [road_canvas.width,road_canvas.height]]);
    calculate_and_draw();
});

function calculate_and_draw(){
    calculate_wheel();
    calculate_road_pattern();
    calculate_demo_road();
    calculate_demo_wheel();
    calculate_demo_bis();
    redrawDemoBis();
    redrawRoad();
    redrawDemo();
    local_collision();
    global_collision();
}



calculate_and_draw();
