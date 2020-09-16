const
	INPUTTYPE_KEY=0,
	INPUTTYPE_PADKEY=1,
	INPUTTYPE_2DAXIS=2,
	INPUTTYPE_MOUSE=3,
	INPUTTYPE_MOUSEBUTTON=4,
	INPUTTYPE_TOUCHAREA=5,
	INPUTTYPE_TOUCHBUTTON=6,
	CONTROLTYPE_KEYBOARD=1,
	CONTROLTYPE_CONTROLLER=2,
	CONTROLTYPE_KEYMOUSE=3,
	CONTROLTYPE_TOUCH=4,
	CONTROLLER_PREFIX="Pad-",
	CONTROLSMODEL={
		KEYBOARD:{
			controlType:CONTROLTYPE_KEYBOARD,
			input:[
				{id:"moveForward",inputType:INPUTTYPE_KEY},
				{id:"moveBackward",inputType:INPUTTYPE_KEY},
				{id:"rotateRight",inputType:INPUTTYPE_KEY},
				{id:"rotateLeft",inputType:INPUTTYPE_KEY},
				{id:"fire",inputType:INPUTTYPE_KEY},
				{id:"action",inputType:INPUTTYPE_KEY},
				{id:"strafe",inputType:INPUTTYPE_KEY},
				{id:"systemUp",inputType:INPUTTYPE_KEY,locked:true},
				{id:"systemDown",inputType:INPUTTYPE_KEY,locked:true},
				{id:"systemLeft",inputType:INPUTTYPE_KEY,locked:true},
				{id:"systemRight",inputType:INPUTTYPE_KEY,locked:true},
				{id:"systemConfirm",inputType:INPUTTYPE_KEY,locked:true},
				{id:"systemCancel",inputType:INPUTTYPE_KEY,locked:true}
			]
		},
		KEYMOUSE:{
			controlType:CONTROLTYPE_KEYMOUSE,
			input:[
				{id:"aimPointer",inputType:INPUTTYPE_MOUSE,locked:true},
				{id:"strafeForward",inputType:INPUTTYPE_KEY},
				{id:"strafeBackward",inputType:INPUTTYPE_KEY},
				{id:"strafeRight",inputType:INPUTTYPE_KEY},
				{id:"strafeLeft",inputType:INPUTTYPE_KEY},
				{id:"fire",inputType:INPUTTYPE_MOUSEBUTTON},
				{id:"action",inputType:INPUTTYPE_MOUSEBUTTON}
			]
		},
		CONTROLLER:{
			controlType:CONTROLTYPE_CONTROLLER,
			canVibrate:true,
			vibrateController:true,
			input:[
				{id:"rotateAxis",inputType:INPUTTYPE_2DAXIS},
				{id:"moveAxis",inputType:INPUTTYPE_2DAXIS},
				{id:"moveForward",inputType:INPUTTYPE_PADKEY},
				{id:"moveBackward",inputType:INPUTTYPE_PADKEY},
				{id:"rotateRight",inputType:INPUTTYPE_PADKEY},
				{id:"rotateLeft",inputType:INPUTTYPE_PADKEY},
				{id:"fire",inputType:INPUTTYPE_PADKEY},
				{id:"action",inputType:INPUTTYPE_PADKEY},
				{id:"strafe",inputType:INPUTTYPE_PADKEY},
				{id:"systemUp",inputType:INPUTTYPE_PADKEY},
				{id:"systemDown",inputType:INPUTTYPE_PADKEY},
				{id:"systemLeft",inputType:INPUTTYPE_PADKEY},
				{id:"systemRight",inputType:INPUTTYPE_PADKEY},
				{id:"systemConfirm",inputType:INPUTTYPE_PADKEY},
				{id:"systemCancel",inputType:INPUTTYPE_PADKEY}
			]
		},
		TOUCH:{
			controlType:CONTROLTYPE_TOUCH,
			canVibrate:true,
			input:[
				{id:"rotateAxis",inputType:INPUTTYPE_TOUCHAREA},
				{id:"moveAxis",inputType:INPUTTYPE_TOUCHAREA},
				{id:"fire",inputType:INPUTTYPE_TOUCHBUTTON},
				{id:"action",inputType:INPUTTYPE_TOUCHBUTTON},
				{id:"systemUp",inputType:INPUTTYPE_TOUCHBUTTON,locked:true},
				{id:"systemDown",inputType:INPUTTYPE_TOUCHBUTTON,locked:true},
				{id:"systemLeft",inputType:INPUTTYPE_TOUCHBUTTON,locked:true},
				{id:"systemRight",inputType:INPUTTYPE_TOUCHBUTTON,locked:true},
				{id:"systemConfirm",inputType:INPUTTYPE_TOUCHBUTTON,locked:true},
				{id:"systemCancel",inputType:INPUTTYPE_TOUCHBUTTON,locked:true}
			]
		}
	},
	CONTROLSLABELS={
		aimPointer:"Aim",
		rotateAxis:"Analog rotate",
		moveAxis:"Analog move",
		moveForward:"Move forward",
		moveBackward:"Move backward",
		moveLeft:"Move left",
		moveRight:"Move right",
		rotateRight:"Turn right",
		rotateLeft:"Turn left",
		strafeForward:"Move forward",
		strafeBackward:"Move backward",
		strafeLeft:"Strafe left",
		strafeRight:"Strafe right",
		fire:"Fire",
		action:"Action/Aim",
		strafe:"Strafe",
		systemUp:"Menu up",
		systemDown:"Menu down",
		systemLeft:"Menu left",
		systemRight:"Menu right",
		systemCancel:"Menu cancel",
		systemConfirm:"Menu confirm"
	};

var CONTROLS,
	SYSTEMCONTROLS={},
	CONTROLSAVAIL={},
	GAMECONTROLS={},
	CONTROLSSETTINGS={},
	CONTROLSDEFAULT={};

CONTROLSDEFAULT[CONTROLTYPE_KEYBOARD]={
	moveForward:87,
	moveBackward:83,
	rotateRight:68,
	rotateLeft:65,
	fire:71,
	action:72,
	strafe:70,
	systemUp:38,
	systemDown:40,
	systemLeft:37,
	systemRight:39,
	systemCancel:49,
	systemConfirm:13
};
CONTROLSDEFAULT[CONTROLTYPE_KEYMOUSE]={
	strafeForward:87,
	strafeBackward:83,
	strafeRight:68,
	strafeLeft:65,
	fire:0,
	action:2
};
CONTROLSDEFAULT[CONTROLTYPE_CONTROLLER]={
	rotateAxis:[0,2],
	moveAxis:[0,0],
	moveForward:12,
	moveBackward:13,
	rotateRight:15,
	rotateLeft:14,
	strafe:0,
	fire:5,
	action:4,
	systemUp:12,
	systemDown:13,
	systemLeft:14,
	systemRight:15,
	systemConfirm:9,
	systemCancel:8
};
CONTROLSDEFAULT[CONTROLTYPE_TOUCH]={
	rotateAxis:1,
	moveAxis:0,
	fire:8,
	action:2,
	systemUp:8,
	systemDown:9,
	systemLeft:10,
	systemRight:11,
	systemConfirm:1,
	systemCancel:0
};

function Controls(master) {
	var
		self=this,
		PRESSEDMODE=0,
		HWKEYBOARD=[],
		HWMOUSE={mx:0,my:0,x:0,y:0,buttons:[]},MOUSEBUTTONS=[],
		HWTOUCH={buttons:[],areas:[{cx:0,cy:0,out:[0,0]},{cx:0,cy:0,out:[0,0]}],ids:{}},
		TOUCHBUTTONS=[],
		TOUCHAREAS=[],
		HWCONTROLLERS={},
		KEYBOARD=[],
		KEYS,
		WAITING,WAITINGCB,WAITINGCONTROLTYPE,WAITINGID,WAITINGCOMMAND,WAITINGINPUTTYPE,WAITINGTIMER,
		touchAvailable=this.touchAvailable=master.screenControls=="touch",
		mouseAvailable=this.mouseAvailable=master.screenControls=="mouse",
		vibrationStrength=true,pointerScreen,eventCb,
		touchButtons,touchAreasButtons,touchAreasAnalog,touch,a,b,tx,ty,touchArea,touchIdButton,touchAnalogSensitivity,touchSwipeSensitivity,
		touchSwipeSensitivityRatio=7,touchAnalogSensitivity=3,setTouchHudOpacity=0.3;

	const
		CONTROLS_STORAGE_PREFIX=STORAGE_PREFIX+"ctrl-",
		KEYSYMBOLS={
			8:"Backspace",
			9:"Tab",
			13:"Enter",
			16:"Shift",
			17:"Ctrl",
			18:"Alt",
			19:"Pause/break",
			20:"Caps lock",
			27:"Escape",
			32:"Space",
			33:"Page up",
			34:"Page down",
			35:"End",
			36:"Home",
			37:"Left arrow",
			38:"Up arrow",
			39:"Right arrow",
			40:"Down arrow",
			45:"Insert",
			46:"Delete",
			91:"Left window",
			92:"Right window",
			93:"Select key",
			96:"Numpad 0",
			97:"Numpad 1",
			98:"Numpad 2",
			99:"Numpad 3",
			100:"Numpad 4",
			101:"Numpad 5",
			102:"Numpad 6",
			103:"Numpad 7",
			104:"Numpad 8",
			105:"Numpad 9",
			106:"Multiply",
			107:"Add",
			109:"Subtract",
			110:"Decimal point",
			111:"Divide",
			112:"F1",
			113:"F2",
			114:"F3",
			115:"F4",
			116:"F5",
			117:"F6",
			118:"F7",
			119:"F8",
			120:"F9",
			121:"F10",
			122:"F11",
			123:"F12",
			144:"Num lock",
			145:"Scroll lock",
			186:";",
			187:"=",
			188:",",
			189:"-",
			190:".",
			191:"/",
			192:"`",
			219:"[",
			220:"\\",
			221:"]",
			222:"'"
		};

	function waitInputDone(value) {
		WAITINGCB(value);
		initializeDevices();
		WAITINGCONTROLTYPE=0;
		WAITINGID=0;
		WAITINGCOMMAND=0;
		WAITINGINPUTTYPE=0;
		WAITING=false;
		WAITINGCB=0;
		WAITINGTIMER=10;
	}

	function initializeDevices() {
		var newKeyboard=[];
		KEYS=[];
		for (var k in CONTROLSAVAIL) {
			for (var t in CONTROLSAVAIL[k].model.input)
				if (CONTROLSAVAIL[k].model.input[t].inputType==INPUTTYPE_KEY) {
					var key=CONTROLSSETTINGS[k][CONTROLSAVAIL[k].model.input[t].id];
					if (KEYS.indexOf(key)==-1) {
						KEYS.push(key);
						if (KEYBOARD[key]) newKeyboard[key]=KEYBOARD[key];
						else newKeyboard[key]=0
					}
				}
		}
		KEYBOARD=newKeyboard;
	}

	function padButtonIsPressed(b) {
		if (PRESSEDMODE) return b.pressed;
		else return b==1.0;
	}
	this.setVibrationStrength=function(v) { vibrationStrength=v; }
	this.vibrate=function(controller,rumble) {
		if (vibrationStrength&&CONTROLSAVAIL[controller]&&CONTROLSAVAIL[controller].model.canVibrate) {
			if (CONTROLSAVAIL[controller].model.vibrateController) {
				var gamepad=HWCONTROLLERS[CONTROLSAVAIL[controller].id];
				if (gamepad.gamepad.vibrationActuator) {
					gamepad.gamepad.vibrationActuator.playEffect("dual-rumble", {
					  startDelay: 0,
					  duration: rumble.duration,
					  weakMagnitude: (rumble.weakMagnitude||1)*vibrationStrength,
					  strongMagnitude: (rumble.strongMagnitude||1)*vibrationStrength
					});
				}
			} else DOM.vibrate(rumble.duration);
		}
	}
	this.indexControls=function() {

		// Check detatched controls
		for (var k in CONTROLSAVAIL) {
			var controller=CONTROLSAVAIL[k];
			switch (controller.model.controlType) {
				case CONTROLTYPE_CONTROLLER:{
					if (!HWCONTROLLERS[controller.id]) {
						console.log("Controller "+controller.id+" detatched.");
						delete CONTROLSAVAIL[controller.id];
						delete GAMECONTROLS[controller.id];
						delete CONTROLSSETTINGS[controller.id];
					}
					break;
				}
			}
		}

		// Add default keyboard
		if (!CONTROLSAVAIL.KEYBOARD)
			CONTROLSAVAIL.KEYBOARD={
				id:"KEYBOARD",
				config:"KEYBOARD",
				label:"Keyboard",
				model:CONTROLSMODEL.KEYBOARD
			};
		// Add default keyboard
		if (mouseAvailable&&!CONTROLSAVAIL.KEYMOUSE)
			CONTROLSAVAIL.KEYMOUSE={
				id:"KEYMOUSE",
				config:"KEYMOUSE",
				label:"Mouse + Keyboard",
				model:CONTROLSMODEL.KEYMOUSE
			};
		// Add touch controls
		if (touchAvailable&&!CONTROLSAVAIL.TOUCH)
			CONTROLSAVAIL.TOUCH={
				id:"TOUCH",
				config:"TOUCH",
				label:"Touch",
				model:CONTROLSMODEL.TOUCH
			};

		
		// Add gamepads
		for (var id in HWCONTROLLERS) {
			if (!CONTROLSAVAIL[id]) {
				console.log("Controller "+id+" attached.");
				CONTROLSAVAIL[id]={
					id:id,
					config:HWCONTROLLERS[id].config,
					label:id+": "+HWCONTROLLERS[id].id,
					model:CONTROLSMODEL.CONTROLLER
				}
			}
		}

		// Initialize game controls
		for (var k in CONTROLSAVAIL) {
			if (!CONTROLSSETTINGS[k]) {
				if (localStorage[CONTROLS_STORAGE_PREFIX+CONTROLSAVAIL[k].config])
					CONTROLSSETTINGS[k]=JSON.parse(localStorage[CONTROLS_STORAGE_PREFIX+CONTROLSAVAIL[k].config]);
				else
					CONTROLSSETTINGS[k]=DOM.clone(CONTROLSDEFAULT[CONTROLSAVAIL[k].model.controlType]);
			}
			if (!GAMECONTROLS[k]) {
				GAMECONTROLS[k]={};	
				for (var i in CONTROLSSETTINGS[k]) GAMECONTROLS[k][i]=0;
			}
		}
		
		// Initialize hardware keyboard
		initializeDevices();
		
	}
	this.resetToDefaults=function(controlid) {
		if (CONTROLSAVAIL[controlid])
			CONTROLSSETTINGS[controlid]=DOM.clone(CONTROLSDEFAULT[CONTROLSAVAIL[controlid].model.controlType]);
	}

	this.resetButtons=function() {
		var k;
		for (k in SYSTEMCONTROLS) SYSTEMCONTROLS[k]=0;
		for (k in HWMOUSE.buttons) HWMOUSE.buttons[k]=0;
		for (k in HWKEYBOARD) HWKEYBOARD[k]=0;
		for (k in HWTOUCH.buttons) HWTOUCH.buttons[k]=0;
	}

	// Mouse

	function initializeMouse(screen) {
		if (screen.requestPointerLock) {
			DOM.addEventListener(screen,"click",(e)=>{ screen.requestPointerLock(); },false);
			DOM.addEventListener(document,"pointerlockchange",changePointerLock,false);
			DOM.addEventListener(document,"mozpointerlockchange",changePointerLock,false);
		}
	}

	function mouseMove(e) {
		HWMOUSE.x+=e.movementX || e.mozMovementX || e.webkitMovementX || 0;
		HWMOUSE.y+=e.movementY || e.mozMovementY || e.webkitMovementY || 0;
	}

	function mouseDown(e) {
		if (WAITING) {
			if (WAITINGINPUTTYPE==INPUTTYPE_MOUSEBUTTON) waitInputDone(e.button);
		} else {
			HWMOUSE.buttons[e.button]=1;
			if (eventCb) eventCb();
		}
	}

	function mouseContextMenu(e) {
		e.preventDefault();
		return false;
	}

	function mouseUp(e) {
		HWMOUSE.buttons[e.button]=0;
	}

	function changePointerLock() {
		if (document.pointerLockElement === pointerScreen || document.mozPointerLockElement === pointerScreen) {
			DOM.addEventListener(window,"mousemove",mouseMove,false);
			DOM.addEventListener(window,"mousedown",mouseDown,false);
			DOM.addEventListener(window,"mouseup",mouseUp,false);
			DOM.addEventListener(window,"contextmenu",mouseContextMenu,false);
		} else {
			DOM.removeEventListener(window,"mousemove",mouseMove,false);
			DOM.removeEventListener(window,"mousedown",mouseDown,false);
			DOM.removeEventListener(window,"mouseup",mouseUp,false);
			DOM.removeEventListener(window,"contextmenu",mouseContextMenu,false);
		}
	}

	// Touch screen

	function resizeTouchArea(area,x,y,w,h) {
		area.x1=x;
		area.y1=y;
		area.x2=x+w;
		area.y2=y+h;
		area.node.style.left=x+"px";
		area.node.style.top=y+"px";
		area.node.style.width=(w-1)+"px";
		area.node.style.lineHeight=area.node.style.height=(h-1)+"px";
		area.node.style.opacity=touchHudOpacity;
	}

	function createTouchPanel(label) {
		var node=document.createElement("div");
		node.className="touchPanel";
		document.body.appendChild(node);
		node.innerHTML=label;
		return node;
	}

	this.setTouchSwipeSensitivity=function(v) { touchSwipeSensitivityRatio=14*v; }
	this.setTouchAnalogSensitivity=function(v) { touchAnalogSensitivityRatio=6*v; }
	this.setTouchHudOpacity=function(v) { touchHudOpacity=v; }

	this.resizeScreen=function(w,h) {
		if (touchAvailable) {
			var
				w_2=w/2,h_5=h/5,w_6=w/6,minSize=QMATH.min(w,h),
				maximumSwipe=w*0.45; // (9/10 of a wide button)

			touchSwipeSensitivity=minSize/touchSwipeSensitivityRatio;
			if (touchSwipeSensitivity>maximumSwipe) touchSwipeSensitivity=maximumSwipe; // Swipes can't be longer than than 0.45 of the screen
			touchAnalogSensitivity=minSize/touchAnalogSensitivityRatio;

			resizeTouchArea(touchAreasButtons[0],0,0,w_2,h_5);
			resizeTouchArea(touchAreasButtons[1],w_2,0,w_2,h_5);
			resizeTouchArea(touchAreasButtons[2],0,h_5,w_2,h_5);
			resizeTouchArea(touchAreasButtons[3],w_2,h_5,w_2,h_5);

			resizeTouchArea(touchAreasAnalog[0],0,h_5*2,w_2,h_5*3);
			resizeTouchArea(touchAreasAnalog[1],w_2,h_5*2,w_2,h_5*3);

		}
	}

	function checkArea(set,x,y) {
		for (b=0;b<set.length;b++) {
			touchArea=set[b];
			if (
					(x>=touchArea.x1)&&(x<=touchArea.x2)&&
					(y>=touchArea.y1)&&(y<=touchArea.y2)
				) return b;
		}
	}

	function initializeTouchScreen(screen) {
		touchAreasButtons=[
			{
				label:"L1", node:createTouchPanel("L1")
			},
			{
				label:"R1", node:createTouchPanel("R1")
			},
			{
				label:"L2", node:createTouchPanel("L2")
			},
			{
				label:"R2", node:createTouchPanel("R2")
			}				
		];
		touchAreasAnalog=[
			{
				label:"Left half", node:createTouchPanel(""),
				firstButton:4
			},
			{
				label:"Right half", node:createTouchPanel(""),
				firstButton:8
			}
		];
		touchButtons=[
			"L1","R1","L2","R",
			"Left area - swipe up", "Left area - swipe down",
			"Left area - swipe left", "Left area - swipe right",
			"Right area - swipe up", "Right area - swipe down",
			"Right area - swipe left", "Right area - swipe right"
		];
		DOM.addEventListener(window,"touchstart",function(e) {
			for (a=0;a<e.changedTouches.length;a++) {
				touch=e.changedTouches[a];
				// Buttons
				touchArea=checkArea(touchAreasButtons,touch.clientX,touch.clientY);
				if (touchArea!==undefined) {
					if (WAITING) {
						if (WAITINGINPUTTYPE==INPUTTYPE_TOUCHBUTTON) 
							waitInputDone(touchArea);
					} else {
						HWTOUCH.ids[touch.identifier]=touchArea;
						HWTOUCH.buttons[touchArea]=1;
					}
				}
				// Areas
				touchArea=checkArea(touchAreasAnalog,touch.clientX,touch.clientY);
				if (touchArea!==undefined) {
					if (WAITING) {
						if (WAITINGINPUTTYPE==INPUTTYPE_TOUCHAREA) 
							waitInputDone(touchArea);
					} else {
						HWTOUCH.areas[touchArea].out[0]=0;
						HWTOUCH.areas[touchArea].out[1]=0;
						HWTOUCH.areas[touchArea].cx=touch.clientX
						HWTOUCH.areas[touchArea].cy=touch.clientY;
					}
				}
			}
			if (eventCb) eventCb(HWTOUCH.buttons[0],HWTOUCH.buttons[1]);
			e.preventDefault(); 
		},false);
		DOM.addEventListener(window,"touchmove",function(e) {
			for (a=0;a<e.changedTouches.length;a++) {
				touch=e.changedTouches[a];
				// Buttons
				touchIdButton=HWTOUCH.ids[touch.identifier];
				if (touchIdButton!==undefined) {
					touchButton=checkArea(touchAreasButtons,touch.clientX,touch.clientY);
					HWTOUCH.buttons[touchIdButton]=touchButton==touchIdButton;
				}
				// Areas
				touchArea=checkArea(touchAreasAnalog,touch.clientX,touch.clientY);
				if (touchArea!==undefined) {
					tx=touch.clientX-HWTOUCH.areas[touchArea].cx
					ty=touch.clientY-HWTOUCH.areas[touchArea].cy
					HWTOUCH.areas[touchArea].out[0]=tx/touchAnalogSensitivity;
					HWTOUCH.areas[touchArea].out[1]=ty/touchAnalogSensitivity;
					touchArea=touchAreasAnalog[touchArea];
					HWTOUCH.buttons[touchArea.firstButton]=ty<-touchSwipeSensitivity;
					HWTOUCH.buttons[touchArea.firstButton+1]=ty>touchSwipeSensitivity;
					HWTOUCH.buttons[touchArea.firstButton+2]=tx<-touchSwipeSensitivity;
					HWTOUCH.buttons[touchArea.firstButton+3]=tx>touchSwipeSensitivity;
				}
			}
			e.preventDefault();
		},false);
		DOM.addEventListener(window,"touchend",function(e) {
			for (a=0;a<e.changedTouches.length;a++) {
				touch=e.changedTouches[a];
				delete HWTOUCH.ids[touch.identifier];
				// Buttons
				touchButton=checkArea(touchAreasButtons,touch.clientX,touch.clientY);
				if (touchButton!==undefined) HWTOUCH.buttons[touchButton]=0;
				// Areas
				touchArea=checkArea(touchAreasAnalog,touch.clientX,touch.clientY);
				if (touchArea!==undefined) {
					HWTOUCH.areas[touchArea].out[0]=0;
					HWTOUCH.areas[touchArea].out[1]=0;
					touchArea=touchAreasAnalog[touchArea];
					HWTOUCH.buttons[touchArea.firstButton]=0;
					HWTOUCH.buttons[touchArea.firstButton+1]=0;
					HWTOUCH.buttons[touchArea.firstButton+2]=0;
					HWTOUCH.buttons[touchArea.firstButton+3]=0;
				}
			}
			e.preventDefault(); 
		},false);
	}

	// Public

	this.initialize=function(screen) {
		pointerScreen=screen;
		if (touchAvailable) initializeTouchScreen(screen);
		if (mouseAvailable) initializeMouse(screen);		
		DOM.addEventListener(window,"keydown",(e)=>{
			if (WAITING) {
				if (e.keyCode==27) waitInputDone();
				else if (WAITINGINPUTTYPE==INPUTTYPE_KEY)
					waitInputDone(e.keyCode);
			}
			else HWKEYBOARD[e.keyCode]=1;
			e.preventDefault(); 
		});
		DOM.addEventListener(window,"keyup",(e)=>{
			HWKEYBOARD[e.keyCode]=0;
			e.preventDefault(); 
		});
		DOM.addEventListener(window,"gamepadconnected", (e) => {
			HWCONTROLLERS[CONTROLLER_PREFIX+e.gamepad.index]={
				id:e.gamepad.id,
				config:e.gamepad.index+"-"+e.gamepad.id,
				gamepad:e.gamepad
			};
			if (e.gamepad.buttons[0]) PRESSEDMODE=typeof e.gamepad.buttons[0]=="object";
			self.indexControls();
		});
		DOM.addEventListener(window,"gamepaddisconnected", (e) => {
			delete HWCONTROLLERS[CONTROLLER_PREFIX+e.gamepad.index];
			this.indexControls();
		});
		this.indexControls();
	};
	this.frame=function(){
		if (WAITINGTIMER) WAITINGTIMER--; else {			
			// Low-level keyboard
			KEYS.forEach(id=>{
				if (HWKEYBOARD[id])
					if (KEYBOARD[id]==0) KEYBOARD[id]=1;
					else KEYBOARD[id]=2;
				else
					if (KEYBOARD[id]>0) KEYBOARD[id]=-1;
					else KEYBOARD[id]=0;
			});
			for (var id in HWMOUSE.buttons)
				if (HWMOUSE.buttons[id]) {
					if (!MOUSEBUTTONS[id]) MOUSEBUTTONS[id]=1;
					else MOUSEBUTTONS[id]=2;
				} else
					if (MOUSEBUTTONS[id]>0) MOUSEBUTTONS[id]=-1;
					else MOUSEBUTTONS[id]=0;
			for (var id in HWTOUCH.buttons)
				if (HWTOUCH.buttons[id]) {
					if (!TOUCHBUTTONS[id]) TOUCHBUTTONS[id]=1;
					else TOUCHBUTTONS[id]=2;
				} else
					if (TOUCHBUTTONS[id]>0) TOUCHBUTTONS[id]=-1;
					else TOUCHBUTTONS[id]=0;
			// Keyboard
			CONTROLSAVAIL.KEYBOARD.model.input.forEach(input=>{
				GAMECONTROLS.KEYBOARD[input.id]=KEYBOARD[CONTROLSSETTINGS.KEYBOARD[input.id]];
			});
			// Keymouse
			if (mouseAvailable) {
				CONTROLSAVAIL.KEYMOUSE.model.input.forEach(input=>{
					switch (input.inputType) {
						case INPUTTYPE_KEY:{
							GAMECONTROLS.KEYMOUSE[input.id]=KEYBOARD[CONTROLSSETTINGS.KEYMOUSE[input.id]];
							break;
						}
						case INPUTTYPE_MOUSEBUTTON:{
							GAMECONTROLS.KEYMOUSE[input.id]=MOUSEBUTTONS[CONTROLSSETTINGS.KEYMOUSE[input.id]]||0;
							break;
						}
						case INPUTTYPE_MOUSE:{
							GAMECONTROLS.KEYMOUSE[input.id]=[HWMOUSE.x,HWMOUSE.y];
							break;
						}
					}				
				});
				HWMOUSE.x=0;
				HWMOUSE.y=0;
			}
			// Touch
			if (touchAvailable)
				CONTROLSAVAIL.TOUCH.model.input.forEach(input=>{
					if (input.inputType==INPUTTYPE_TOUCHBUTTON)
						GAMECONTROLS.TOUCH[input.id]=TOUCHBUTTONS[CONTROLSSETTINGS.TOUCH[input.id]];
					else
						GAMECONTROLS.TOUCH[input.id]=HWTOUCH.areas[CONTROLSSETTINGS.TOUCH[input.id]].out;
				});
			// Gamepads
			var gamepads = navigator.getGamepads();
			for (var g=0;g<gamepads.length;g++) {
				gamepad=gamepads[g];
				if (gamepad) {
					var
						id=CONTROLLER_PREFIX+gamepad.index,
						ctrl=CONTROLSAVAIL[id],
						settings=CONTROLSSETTINGS[id],
						gameControls=GAMECONTROLS[id];
					if (ctrl) {
						if (WAITING) {
							ctrl.model.input.forEach(input=>{ gameControls[input.id]=0; });
							if (WAITINGID==id)
								if (WAITINGINPUTTYPE==INPUTTYPE_PADKEY) {
									for (b=0;b<gamepad.buttons.length;b++)
										if (padButtonIsPressed(gamepad.buttons[b])) waitInputDone(b);
								} else if (WAITINGINPUTTYPE==INPUTTYPE_2DAXIS) {
									for (var i=0;i<gamepad.axes.length;i+=2) {
										if (
											(QMATH.abs(gamepad.axes[i])!=1)&&(QMATH.abs(gamepad.axes[i+1])!=1)&&
											(
												(QMATH.abs(gamepad.axes[i])>0.7)||(QMATH.abs(gamepad.axes[i+1])>0.7)
											)
										) waitInputDone([0,i]);
									}
									// Patch for PS4 Gamepad on Ubuntu
									if (PRESSEDMODE&&waitInputDone)
										for (var i=0;i<gamepad.buttons.length;i+=2) {
											if (gamepad.buttons[i].value&&(gamepad.buttons[i].value!=1)&&QMATH.abs(0.5-gamepad.buttons[i].value)>0.2)
												 waitInputDone([1,i]);
										}
									
								}
						} else ctrl.model.input.forEach(input=>{
							var inputid=input.id;
							switch (input.inputType) {
								case INPUTTYPE_2DAXIS:{
									if (settings[inputid][0]) {
										gameControls[inputid]=[
											(gamepad.buttons[settings[inputid][1]].value||0)-0.5,
											(gamepad.buttons[settings[inputid][1]+1].value||0)-0.5
										];
									} else
										gameControls[inputid]=[
											gamepad.axes[settings[inputid][1]]||0,
											gamepad.axes[settings[inputid][1]+1]||0
										];
									break;
								}
								case INPUTTYPE_PADKEY:{
									if (gamepad.buttons[settings[inputid]])									
										if (padButtonIsPressed(gamepad.buttons[settings[inputid]]))
											if (gameControls[inputid]==0) gameControls[inputid]=1;
											else gameControls[inputid]=2;
										else if (gameControls[inputid]>0) gameControls[inputid]=-1;
											else gameControls[inputid]=0;
									break;
								}
							}
						});
					}
				}
			}
			// System controls
			SYSTEMCONTROLS.up=0;
			SYSTEMCONTROLS.down=0;
			SYSTEMCONTROLS.left=0;
			SYSTEMCONTROLS.right=0;
			SYSTEMCONTROLS.cancel=0;
			SYSTEMCONTROLS.confirm=0;
			for (var k in GAMECONTROLS) {
				if (GAMECONTROLS[k].systemUp) SYSTEMCONTROLS.up=GAMECONTROLS[k].systemUp;
				if (GAMECONTROLS[k].systemDown) SYSTEMCONTROLS.down=GAMECONTROLS[k].systemDown;
				if (GAMECONTROLS[k].systemLeft) SYSTEMCONTROLS.left=GAMECONTROLS[k].systemLeft;
				if (GAMECONTROLS[k].systemRight) SYSTEMCONTROLS.right=GAMECONTROLS[k].systemRight;
				if (GAMECONTROLS[k].systemCancel) SYSTEMCONTROLS.cancel=GAMECONTROLS[k].systemCancel;
				if (GAMECONTROLS[k].systemConfirm) SYSTEMCONTROLS.confirm=GAMECONTROLS[k].systemConfirm;
			}
		}
	}
	this.setInputSetting=function(controlid,id,value) {
		CONTROLSSETTINGS[controlid][id]=value;
		initializeDevices();
	}
	this.saveSettings=function() {
		var changed=false;
		for (var k in CONTROLSSETTINGS) {
			var
				key=CONTROLS_STORAGE_PREFIX+CONTROLSAVAIL[k].config,
				newValue=JSON.stringify(CONTROLSSETTINGS[k]);
			if (localStorage[key]&&(localStorage[key]!=newValue)) changed=true;
			localStorage[key]=newValue;
		}
		return changed;
	}
	this.waitInput=function(controlid,controlcommand,cb) {
		initializeDevices();
		if (CONTROLSAVAIL[controlid]) {
			var control=CONTROLSAVAIL[controlid];
			WAITINGCONTROLTYPE=control.model.controlType;
			control.model.input.forEach(input=>{
				if (input.id==controlcommand) WAITINGINPUTTYPE=input.inputType;
			});
			this.resetButtons();
			WAITINGID=controlid;
			WAITINGCOMMAND=controlcommand;
			WAITINGCB=cb;
			WAITINGTIMER=10;
			WAITING=true;
			return true;
		} else return false;
	}
	this.buttonToLabel=function(controltype,inputtype,value) {
		var ret="ID "+value;
		switch (inputtype) {
			case INPUTTYPE_KEY:{
				if (KEYSYMBOLS[value]) ret=KEYSYMBOLS[value];
				else ret=String.fromCharCode(value);
				break;
			}
			case INPUTTYPE_PADKEY:{
				ret="Button "+value
				break;
			}
			case INPUTTYPE_2DAXIS:{
				if (value[0])
					ret="Button "+value[1]+"/"+(value[1]+1);
				else
					ret="Axis "+value[1]+"/"+(value[1]+1);
				break;
			}
			case INPUTTYPE_MOUSE:{
				ret="Mouse";
				break;
			}
			case INPUTTYPE_MOUSEBUTTON:{
				ret="Mouse button "+value;
				break;
			}
			case INPUTTYPE_TOUCHBUTTON:{
				ret=touchButtons[value];
				break;
			}
			case INPUTTYPE_TOUCHAREA:{
				ret=touchAreasAnalog[value].label;
				break;
			}
		}
		return ret;
	}
	this.registerEventCallback=function(cb) {
		eventCb=cb;
	}
}

function ControlsSettings() {
	const
		MENUCOLOR=PALETTE.BLACK;
		
	var
		menu,state,settingDevice,configuring;

	this.show=function() {
		state="initialize";
		settingDevice=0;
		configuring=0;
		TRANSITION.start();
	}
	this.initialize=function() {
		menu=new KeyMenu();
	}
	this.frame=function() {
		switch (state) {
			case "initialize":{
				menu.setMenu({title:"Initializing...",options:[]});
				state="selectinput";
				CONTROLS.indexControls();
				break;
			}
			case "selectinput":{
				var options=[];
				menu.setTitle("Select control");
				for (var k in CONTROLSAVAIL)
					options.push({
						id:k,
						label:CONTROLSAVAIL[k].label
					});
				menu.setOptions(options);
				switch (menu.frame(TRANSITION.isFree)) {
					case MENU_CONFIRM:{
						settingDevice=menu.selectedOption.id;
						state="configure";
						configuring=0;
						menu.reset();
						break;
					}
					case MENU_CANCEL:{
						TRANSITION.end(-1);
						if (CONTROLS.saveSettings())
							TRANSITION.notify("Got it!","Controls configuration saved");
						break;
					}
				}
				break;
			}
			case "configure":{
				var
					device=CONTROLSAVAIL[settingDevice],
					config=CONTROLSSETTINGS[settingDevice],
					options=[];

				menu.setTitle("Control - "+device.label);

				device.model.input.forEach((input,id)=>{
					options.push({
						id:input.id,
						label:CONTROLSLABELS[input.id],
						value:input.id==configuring?"...":CONTROLS.buttonToLabel(device.model.controlType,input.inputType,config[input.id]),
						locked:input.locked
					})
				});
				options.push({id:"resetDefault",label:"Reset to default",reset:true});
				menu.setOptions(options);

				if (!configuring)
					switch (menu.frame(TRANSITION.isFree)) {
						case MENU_CONFIRM:{
							if (menu.selectedOption.reset) {
								CONTROLS.resetToDefaults(settingDevice);
							} else if (!menu.selectedOption.locked) {
								configuring=menu.selectedOption.id;
								CONTROLS.waitInput(settingDevice,configuring,button=>{
									if (button!==undefined)
										CONTROLS.setInputSetting(settingDevice,configuring,button);
									configuring=0;
								});
							}
							break;
						}
						case MENU_CANCEL:{
							state="initialize";
							menu.reset();
							break;
						}
					}
				break;
			}
		}
			
		return TRANSITION.getState();
	}
	this.render=function(ctx) {
		CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		menu.render(ctx);
		TRANSITION.render(ctx);
	}
}

