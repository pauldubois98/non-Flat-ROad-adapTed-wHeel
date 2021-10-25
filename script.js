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

const STD_RADIUS = 55;
const STD_CENTER = 155;
var ROAD_EDITING = true;
var ROAD_EDITING_ON = false;
var road = [[0,road_canvas.height],
            [0,road_canvas.height-STD_RADIUS],
            [road_canvas.width,road_canvas.height-STD_RADIUS],
            [road_canvas.width,road_canvas.height]];
var road_pattern = [[0,road_canvas.height],
                    [0,road_canvas.height-STD_RADIUS],
                    [road_canvas.width,road_canvas.height-STD_RADIUS],
                    [road_canvas.width,road_canvas.height]];
var editing_start_x = 0;
var editing_start_y = 0;
var editing_point_index = 0;

var road_pattern_length = road_canvas.width;
var road_pattern_end = road_canvas.height-STD_RADIUS;
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
        if(editing_point_index ==0 || editing_point_index == road.length-1){
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
        if(event.button == 2 && editing_point_index>=0){
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
        if(road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x>road[editing_point_index-1][0]
            && road[editing_point_index][0]+event.pageX-roadLeft-editing_start_x<road[editing_point_index+1][0]
            && editing_point_index!=1 && editing_point_index!=road.length-2){
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
            [0,road_canvas.height-STD_RADIUS],
            [road_canvas.width,road_canvas.height-STD_RADIUS],
            [road_canvas.width,road_canvas.height]];
    ROAD_EDITING=true;
    edit_road_btn.textContent = "Edit Road ON";
    calculate_and_draw();
});
edit_road_btn.addEventListener('click', function(event){
    ROAD_DRAWING=false;
    if (ROAD_EDITING){
        ROAD_EDITING=false;
        edit_road_btn.textContent = "Edit Road OFF";
    } else{
        ROAD_EDITING=true;
        edit_road_btn.textContent = "Edit Road ON";
    };
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
}



calculate_and_draw();
