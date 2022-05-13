---
layout: game
title: scripts for interactivebuddy
---
Interactive Buddy Scripts
How To Use:
Copy and paste the scripts into the Interactive Buddy script engine.
To get to the script engine go to the "Modes" tab and click "Scripting Engine Access..."

Cannon Script:
assign(yChange, (getYMouse()-getBuddyY())/20); 
assign(xChange, (getXMouse()-getBuddyX())/20); 
if(getMouseDown(), create("bowlball", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), explode(getXMouse()+xChange, getYMouse()+yChange, 1));

Nuke Script:
t=t+1; 
if(t%2,shock(20,200,0,0,140,100),0) 
t=t+1; 
if(t%2,water(20,200,0,0,140,100),0) 
t=t+1; 
if(t%2,fire(20,200,0,0,140,100),0) 
t=t+1;

Extreme Nuke (100x More Powerful):
t=t+100; 
if(t%2,shock(20,200,0,0,140,100),0) 
t=t+100; 
if(t%2,fire(20,200,0,0,140,100),0) 
t=t+100; 
if(t%2,fire(20,200,0,0,140,100),0) 
t=t+100;

Ultra Grenade (Use With Open Hand):
if(getMouseDown(), explode(getXMouse()+xChange, getYMouse()+yChange, 1)); 
if(getMouseDown(), create("molotov", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), create("molotov", getXMouse(), getYMouse(), 0, 0));

30K Explosion (May Cause Crashes):
x = getBuddyX(); 
y = getBuddyY(); 
power = 9999; 
explode(x,y,power);

Mega Explosion:
if(getMouseDown(), create("grenade", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), explode(getXMouse()+xChange, getYMouse()+yChange, 1)); 
if(getMouseDown(), create("molotov", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), create("fireballs", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), create("mine", getXMouse(), getYMouse(), 0, 0));

Mega Explosion (With Grenade):
if(getMouseDown(), create("grenade", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), explode(getXMouse()+xChange, getYMouse()+yChange, 1)); 
if(getMouseDown(), create("molotov", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), create("fireballs", getXMouse(), getYMouse(), 0, 0)); 
if(getMouseDown(), create("grenade", getXMouse(), getYMouse(), 0, 0));

Lightning:
if(getMouseDown() && bnot(oMouse), 
playSound("shock",100)+ 
assign(rr,random()*1000)+ 
assign(n,0)+ 
assign(t,25)+ 
loop(t,shock(getXMouse()+sin(n/t*10+rr)*15,n/t*400)+assign(n,n+1) 
,0); 
oMouse = getMouseDown()

Rain Of Hell:
t=t+1; 
if(t%2,shock(sin(t*.0500)*275+275,cos(t*.050)*0+200,0,0,140,.075,2,2,fa 
lse),0) 
t=t+1; 
if(t%2,water(sin(t*.0500)*275+270,cos(t*.050)*0+200,0,0,140,.075,2,2,fa 
lse),0) 
t=t+1; 
if(t%2,fire(sin(t*.0500)*275+265,cos(t*.050)*0+200,0,0,140,.075,2,2,fa 
lse),0) 
if(t%2,fire(sin(t*.0500)*275+265,cos(t*.050)*0+200,0,0,140,.075,2,2,fa 
lse),0)

Happy Fire:
if(getMouseDown(),fire(getXMouse(),getYM ouse(),1,1,50,20));

Killer Ball:
if(getMouseDown(),shock(getXMouse(),getYM ouse(),0,0,5,2)); 
if(getMouseDown(),water(getXMouse(),getYM ouse(),0,0,5,2)); 
if(getMouseDown(),fire(getXMouse(),getYM ouse(),0,0,5,2));

Fire Hand:
if(getMouseDown(),fire(getXMouse(),getYM ouse(),0,0,5,2)); 
if(getMouseDown(),fire(getXMouse(),getYM ouse(),0,0,5,2)); 
if(getMouseDown(),fire(getXMouse(),getYM ouse(),0,0,5,2));

Fly When Happy:
i=i+1; 
if(equal(i%50, 0), say("My happiness is 
" + getEmotion(),100)); 
addBuddyVel(0, 0-getEmotion()/25);

Explode/Shocking:
dan = 1; 
if(getMouseDown() && bnot(M), 
explode(getXMouse(),getYMouse(),dan)+ 
loop(10,shock(getBuddyX(),getBuddyY())) 
,0); 
M = getMouseDown() 

Cursor Shield: 
if(firstRun(), 
say("OH SHIT!!!!!!!!!!",200)+ 
flashMessage("Cursor Shield Activated.",200) 
,0); 
if(getMouseDown(), 
playSound("shock",25)+ 
shock(getXMouse()-20,getYMouse())+ 
shock(getXMouse()-20,getYMouse()-20)+ 
shock(getXMouse(),getYMouse()-20)+ 
shock(getXMouse()+20,getYMouse())+ 
shock(getXMouse()+20,getYMouse()-20)+ 
shock(getXMouse(),getYMouse()+20)+ 
shock(getXMouse()-20,getYMouse()+20)+ 
shock(getXMouse()+20,getYMouse()+20) 
,0)

Cursor Shield V2:
v = 2; 
distance = 25; 
if(firstRun(), 
say("OH SHIT IT'S VERSION "+v+"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",200)+ 
flashMessage("Cursor Shield Version "+v+" Activated.",200) 
,0); 
if(getMouseDown(), 
playSound("shock",25)+ 
shock(getXMouse()-distance,getYMouse())+ 
shock(getXMouse()-distance,getYMouse()-distance)+ 
shock(getXMouse(),getYMouse()-distance)+ 
shock(getXMouse()+distance,getYMouse())+ 
shock(getXMouse()+distance,getYMouse()-distance)+ 
shock(getXMouse(),getYMouse()+distance)+ 
shock(getXMouse()-distance,getYMouse()+distance)+ 
shock(getXMouse()+distance,getYMouse()+distance) 
,0)

<br>

btw these are literally just copy and pasted from <a href="https://sites.google.com/site/freeeducationgames/walkthroughs-cheats/interactive-buddy-scripts"> here </a>
