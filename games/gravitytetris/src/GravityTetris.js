
var canvasID = document.getElementById( 'GravityTetrisCanvas' );
var canvas = canvasID.getContext( '2d' );

function GravityTetris()
{
	//------------------------------------
	// math constants
	//------------------------------------
    var ZERO        = 0.0;
    var ONE_HALF    = 0.5;
    var ONE         = 1.0;
	
	//------------------------------------
	// rendering
	//------------------------------------
	var MILLISECONDS_PER_UPDATE = 20;
	var MOTION_BLUR     = 0.6;	
	var WINDOW_WIDTH    = canvasID.width;
	var WINDOW_HEIGHT   = canvasID.height;
	var SHOW_PHYSICS    = false;
	var SHOW_NODE_GRID  = false;
	var SHOW_ROWS       = false;
	var SHOW_DROPPED    = true;
	
	//------------------------------------
	// logic
	//------------------------------------
	var MAX_PIECES              = 150;
	var NUM_PHYSICS_LOOPS       = 4;
	var NULL_PIECE              = -1;
	var NULL_NODE               = -1;
	var NULL_COLUMN             = -1;
	var NULL_ROW                = -1;
	var NUM_NODES_PER_PIECE     =  4;
	var NUM_SPRINGS_PER_PIECE   =  6;
	var NUM_TETRIS_COLUMNS      = 10;
	var NUM_TETRIS_ROWS         = 20;
	var NODE_RADIUS             = ( WINDOW_WIDTH / NUM_TETRIS_COLUMNS ) * ONE_HALF;
	var UPPER_BUFFER            = -200.0;
	var INITIAL_HEIGHT          = -50.0;
	var INITIAL_DROP_PERIOD     = 300;
	var FINAL_DROP_PERIOD       = 100;
	var DROP_PERIOD_REDUCTION   = 1;
	var WARMING_RATE            = 0.002;
	var WAITING_DURATION        = 500;
	var FREEZING_RATE           = 0.001;	
	var NUM_FREEZE_COLLISIONS   = 50;
	var NUM_DROP_COLLISIONS     = 1;
	var POST_DROP_FRIGIDITY     = 0.4;
    var MAX_DROPPED_DURATION    = 50;

	//------------------------------------
	// physics forces
	//------------------------------------
    var GRAVITY             = 0.02;
    var INITIAL_SPIN        = 0.2;
	var SPRING_TENSION      = 0.3;
	var RELAXATION          = 0.5;
	var COLLISION_FORCE     = 1.0;
	var COLLISION_FRICTION  = 0.3;
	var FRICTION            = 0.01;
	var BOUNCE              = 0.8;
    var GRAB_FORCE          = 0.1;
    var GRAB_FRICTION       = 0.2;
   	var GRID_FORCE          = 0.02;
	var ORTHOGONAL_FORCE    = 0.1;
	var SETTLE_FRICTION     = 0.4;
	var STRESS_LIMIT        = 0.7;

	//-----------------------
	// types
	//-----------------------
	var NULL_TYPE      = -1;
	var TYPE_STRAIGHT  =  0;
	var TYPE_L_LEFT    =  1;
	var TYPE_L_RIGHT   =  2;
	var TYPE_ZIG_LEFT  =  3;
	var TYPE_ZIG_RIGHT =  4;
	var TYPE_SQUARE    =  5;
	var TYPE_T         =  6;
	var NUM_TYPES      =  7;

	//-----------------------
	// modes
	//-----------------------
	var MODE_NULL           = -1;
	var MODE_FALLING        =  0;
	var MODE_DROPPED        =  1;
	var MODE_FREEZING       =  2;   
	var MODE_FROZEN         =  3;   
	var NUM_MODES           =  4;   
	
	//------------------------------------
	// type colors
	//------------------------------------
	var STRAIGHT_COLOR  = "rgb( 200,  50,  50 )";
	var L_LEFT_COLOR    = "rgb(  70, 170,  70 )";
	var L_RIGHT_COLOR   = "rgb(  70,  90, 200 )";
	var ZIG_LEFT_COLOR  = "rgb( 190, 190,  40 )";
	var ZIG_RIGHT_COLOR = "rgb( 160,  50, 200 )";
	var SQUARE_COLOR    = "rgb( 190, 130,  40 )";
	var T_COLOR         = "rgb(  30, 150, 150 )";
	
	function Row()
	{
		this.filled = new Array( NUM_TETRIS_COLUMNS ); 		
	}	

	function Vector2()
	{
		this.x = ZERO; 
		this.y = ZERO; 
	}	

	function Grab()
	{
        this.piece  = NULL_PIECE;
        this.node   = NULL_NODE;
		this.active = false; 
	}	

	function Node()
	{
	    this.position       = new Vector2();
	    this.velocity       = new Vector2();
	    this.gridPosition   = new Vector2();
	    this.column         = NULL_COLUMN;
	    this.row            = NULL_ROW;
	}	
	
	function Spring()
	{
	    this.length = ZERO;
	    this.node1  = NULL_NODE;
	    this.node2  = NULL_NODE;
	}	
    
	function TetPiece()
	{
	    this.numCollisions  = 0;
	    this.frigidity      = ZERO;
        this.stressed       = false; 
	    this.mode           = MODE_NULL;
        this.color          = "rgb( 0, 0, 0 )";
	    this.position       = new Vector2();
	    this.axis           = new Vector2();
		this.type           = NULL_TYPE; 
	    this.axisNode       = NULL_NODE;
        this.nodes          = new Array( NUM_NODES_PER_PIECE   );	
        this.springs        = new Array( NUM_SPRINGS_PER_PIECE );	
	}	
    
	var _initialized    = false;
	var _dropPeriod     = INITIAL_DROP_PERIOD;
	var _numPieces      = 0;
	var _clock          = 0;
	var _score          = 0;
	var _pieces         = new Array( MAX_PIECES );
	var _mouseDown      = false;
	var _grab           = new Grab();
	var _rows           = new Array( NUM_TETRIS_ROWS ); 
	var _gameOver       = false;
	var _mouseX         = 0;
	var _mouseY         = 0;
	var _lastMouseX     = 0;
	var _lastMouseY     = 0;
	var _leftWall       = 10.0;//canvas.getBoundingClientRect().left;
	var _topWall        = 10.0;//canvas.getBoundingClientRect().top;


	//------------------------
	this.update = function()
	{		
	    if ( ! _initialized )
	    {    	    
            //-------------------
            // initialize
            //-------------------
    	    this.initialize();    	  
    	    _initialized = true;   
        }
        else
        {
            if ( !_gameOver )
            {
                //-------------------------------------
                // increment clock
                //-------------------------------------
                _clock ++;
                
                //-------------------------------------
                // update dropping new pieces
                //-------------------------------------
                if ( _clock % _dropPeriod == 0 )
                {
                    _dropPeriod -= DROP_PERIOD_REDUCTION;
                    
                    if ( _dropPeriod < FINAL_DROP_PERIOD )
                    {
                        _dropPeriod = FINAL_DROP_PERIOD;
                    }
                    
                    if ( _numPieces < MAX_PIECES )
                    {
                        var type = Math.floor( Math.random() * NUM_TYPES );        
                        
                        var initialX = WINDOW_WIDTH * ONE_HALF;
                        var initialY = INITIAL_HEIGHT;
                        
                        this.initializePiece( _numPieces, initialX, initialY, type );   
        
                        _numPieces ++;
                    }
                }
    
                //-------------------------------------
                // apply physics
                //-------------------------------------
                for (var i=0; i<NUM_PHYSICS_LOOPS; i++)
                {
                    this.updatePhysics();
                }
                
                //-----------------------
                // refresh rows state
                //-----------------------
                this.reCalculateRows();
            }
        
            //-----------------------
            // render that puppy...
            //-----------------------
            if ( _gameOver )
            {
                this.renderGameOver();
            }
            else
            {
                this.renderGame();
            }
	    }
	    
        this.timer = setTimeout( "tetris.update()", MILLISECONDS_PER_UPDATE );
	} 
	

	//----------------------------------------
	this.removeRow = function( rowToRemove )
	{	
	    //--------------------------------------------------------
	    // blast away the nodes that cross the row...
	    //--------------------------------------------------------
        for (var p=0; p<_numPieces; p++)
        {
            for (var n=0; n<NUM_NODES_PER_PIECE; n++)
            {
                if ( _pieces[p].nodes[n].row == rowToRemove )
                {
                    _pieces[p].nodes[n].position.y = WINDOW_HEIGHT + NODE_RADIUS;
                    
                    //---------------------------------------
                    // recalculate...
                    //---------------------------------------
                    this.calculateNodeGridPosition( p, n );  
                }
            }
        }
        
        
	    //----------------------
	    // increase score
	    //----------------------
        _score += 100;      

	    //---------------------------------------------------------------
	    // lower all the nodes in the rows above the removed row
	    //---------------------------------------------------------------
        for (var p=0; p<_numPieces; p++)
        {
            if ( p != _grab.piece )                
            {
                if ( _pieces[p].mode != MODE_FALLING )
                {
                    for (var n=0; n<NUM_NODES_PER_PIECE; n++)
                    {
                        for (var r=rowToRemove-1; r>=0; r--)
                        {
                            if ( _pieces[p].nodes[n].row == r )
                            {
                                _pieces[p].nodes[n].position.y += NODE_RADIUS * 2.0;
                
                                //---------------------------------------
                                // recalculate...
                                //---------------------------------------
                                this.calculateNodeGridPosition( p, n );  
                            }
                        }
                    }
                }
            }
        }
    }
    
        


	//--------------------------------
	this.initialize = function()
	{		
        //---------------------------------
        // create the array of tet pieces 
        //---------------------------------
        for (var p=0; p<MAX_PIECES; p++)
        {
            _pieces[p] = new TetPiece();
    
            for (var n=0; n<NUM_NODES_PER_PIECE; n++)
            {
                _pieces[p].nodes[n] = new Node();
            }
    
            for (var s=0; s<NUM_SPRINGS_PER_PIECE; s++)
            {
                _pieces[p].springs[s] = new Spring();
            }
        }
            
        //---------------------------------
        // create the array of cells 
        //---------------------------------
        for (var r=0; r<NUM_TETRIS_ROWS; r++)
        {
            _rows[r] = new Row();
        }	
        
        //---------------------------------
        // start game 
        //---------------------------------
        this.startGame();
	}


	//---------------------------
	this.startGame = function()
	{	
        //---------------------------------
        // num pieces to zero 
        //---------------------------------
	    _numPieces = 0;
	    
        //---------------------------------
        // reset grab state 
        //---------------------------------
        _grab.piece  = NULL_PIECE;
        _grab.node   = NULL_NODE;
		_grab.active = false; 
	
        //---------------------------------
        // set clock 
        //---------------------------------
        _dropPeriod = INITIAL_DROP_PERIOD;
        _clock = _dropPeriod - 10;
        
        //---------------------------------
        // reset pieces 
        //---------------------------------
        for (var p=0; p<MAX_PIECES; p++)
        {
            _pieces[p].numCollisions  = 0;
            _pieces[p].frigidity      = ZERO;
            _pieces[p].stressed       = false; 
            _pieces[p].mode           = MODE_NULL;
        }
        
        //---------------------------------
        // reset row states 
        //---------------------------------
        for (var r=0; r<NUM_TETRIS_ROWS; r++)
        {   
            for (var c=0; c<NUM_TETRIS_COLUMNS; c++)
            {
                _rows[r].filled[c] = false;
            }
        }        
    }
    
    
	//---------------------------------------------
	this.initializePiece = function( p, x, y, type )
	{		
	    _pieces[p].mode = MODE_FALLING;
	    _pieces[p].frigidity = ZERO;
	
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            _pieces[p].nodes[n].position.x = x;
            _pieces[p].nodes[n].position.y = y;            
        }
        
        _pieces[p].axisNode = 1;
        _pieces[p].type = type;

        if ( _pieces[p].type == TYPE_STRAIGHT )
        {
            _pieces[p].color = STRAIGHT_COLOR;
            _pieces[p].nodes[0].position.x += NODE_RADIUS * 0;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 4;
            _pieces[p].nodes[3].position.x += NODE_RADIUS * 6; 
            
            _pieces[p].axisNode = 3;
        }

        if ( _pieces[p].type == TYPE_L_LEFT )
        {
            _pieces[p].color = L_LEFT_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 4;
            _pieces[p].nodes[3].position.y += NODE_RADIUS * 2;

            _pieces[p].axisNode = 2;
        }

        if ( _pieces[p].type == TYPE_L_RIGHT )
        {
            _pieces[p].color = L_RIGHT_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 4;
            _pieces[p].nodes[3].position.y -= NODE_RADIUS * 2;
            
            _pieces[p].axisNode = 2;
        }

        if ( _pieces[p].type == TYPE_ZIG_LEFT )
        {
            _pieces[p].color = ZIG_LEFT_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.y += NODE_RADIUS * 2;
            _pieces[p].nodes[3].position.x += NODE_RADIUS * 4;
            _pieces[p].nodes[3].position.y += NODE_RADIUS * 2;
            
            _pieces[p].axisNode = 1;
        }

        if ( _pieces[p].type == TYPE_ZIG_RIGHT )
        {
            _pieces[p].color = ZIG_RIGHT_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.y -= NODE_RADIUS * 2;
            _pieces[p].nodes[3].position.x += NODE_RADIUS * 4;
            _pieces[p].nodes[3].position.y -= NODE_RADIUS * 2;
            _pieces[p].axisNode = 1;
        }

        if ( _pieces[p].type == TYPE_SQUARE )
        {
            _pieces[p].color = SQUARE_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[2].position.y += NODE_RADIUS * 2;         
            _pieces[p].nodes[3].position.x += NODE_RADIUS * 2;
            _pieces[p].nodes[3].position.y += NODE_RADIUS * 2;
            
            _pieces[p].axisNode = 1;
        }

        if ( _pieces[p].type == TYPE_T )
        {
            _pieces[p].color = T_COLOR;
            _pieces[p].nodes[1].position.x += NODE_RADIUS * 2.0;
            _pieces[p].nodes[2].position.x += NODE_RADIUS * 4.0;
            _pieces[p].nodes[3].position.x += NODE_RADIUS * 2.0;
            _pieces[p].nodes[3].position.y += NODE_RADIUS * 2.0;

            _pieces[p].axisNode = 1;
        }

        //-------------------------------------------
        // wire up the springs
        //-------------------------------------------
        _pieces[p].springs[0].node1 = 0; _pieces[p].springs[0].node2 = 1;
        _pieces[p].springs[1].node1 = 0; _pieces[p].springs[1].node2 = 2;
        _pieces[p].springs[2].node1 = 0; _pieces[p].springs[2].node2 = 3;
        _pieces[p].springs[3].node1 = 1; _pieces[p].springs[3].node2 = 2;
        _pieces[p].springs[4].node1 = 1; _pieces[p].springs[4].node2 = 3;
        _pieces[p].springs[5].node1 = 2; _pieces[p].springs[5].node2 = 3;

        
        for (var s=0; s<NUM_SPRINGS_PER_PIECE; s++)
        {
            var n1 = _pieces[p].springs[s].node1;
            var n2 = _pieces[p].springs[s].node2;
            var xx = _pieces[p].nodes[n2].position.x - _pieces[p].nodes[n1].position.x;
            var yy = _pieces[p].nodes[n2].position.y - _pieces[p].nodes[n1].position.y;
            _pieces[p].springs[s].length = Math.sqrt( xx*xx + yy*yy );
        }
        
        this.calculateCentroid(p);
        
    	//-------------------------------------
	    // give it a little spin
	    //-------------------------------------
        this.spin( p, -INITIAL_SPIN * ONE_HALF + Math.random() * INITIAL_SPIN );
    }	

	//-----------------------------
	this.spin = function( p, s )
	{	
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            var xx =   ( _pieces[p].nodes[n].position.y - _pieces[p].position.y );
            var yy = - ( _pieces[p].nodes[n].position.x - _pieces[p].position.x );

            _pieces[p].nodes[n].velocity.x += xx * s;
            _pieces[p].nodes[n].velocity.y += yy * s;
        }
	}
    
	//-----------------------------------
	this.calculateCentroid = function(p)
	{			
        _pieces[p].position.x = ZERO;
        _pieces[p].position.y = ZERO;
        
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            _pieces[p].position.x += _pieces[p].nodes[n].position.x;
            _pieces[p].position.y += _pieces[p].nodes[n].position.y;
        }

        _pieces[p].position.x /= NUM_NODES_PER_PIECE;
        _pieces[p].position.y /= NUM_NODES_PER_PIECE;
    }	
    

	//-------------------------------
	this.calculateAxis = function(p)
	{		       
        //-------------------------------------------
        // update axis
        //-------------------------------------------
        _pieces[p].axis.x = _pieces[p].nodes[ _pieces[p].axisNode ].position.x - _pieces[p].nodes[0].position.x;
        _pieces[p].axis.y = _pieces[p].nodes[ _pieces[p].axisNode ].position.y - _pieces[p].nodes[0].position.y;
        
        var axisLength = Math.sqrt( _pieces[p].axis.x * _pieces[p].axis.x + _pieces[p].axis.y * _pieces[p].axis.y );
        if ( axisLength > ZERO )
        {
            _pieces[p].axis.x /= axisLength;
            _pieces[p].axis.y /= axisLength;
        }
        else
        {
            _pieces[p].axis.x = ONE;
            _pieces[p].axis.y = ZERO;
        }
    }
	
	//------------------------------
	this.updatePhysics = function()
	{		 
        for (var p=0; p<_numPieces; p++)
        {        
            if ( _pieces[p].mode != MODE_FROZEN )
            {
                //--------------------------
                // spring forces
                //--------------------------
                this.updateSpringForces(p);
                
                //---------------------------------------------
                // update accumulating collisions and freezing
                //---------------------------------------------
                if ( _pieces[p].mode == MODE_FALLING )
                {
                    if ( _pieces[p].numCollisions > NUM_FREEZE_COLLISIONS )
                    {
                        _pieces[p].mode = MODE_FREEZING;
                        _pieces[p].frigidity = ZERO;    
                    }
                }
                else if ( _pieces[p].mode == MODE_DROPPED )
                {
                    if ( _pieces[p].numCollisions > NUM_DROP_COLLISIONS )
                    {                    
                        _pieces[p].mode = MODE_FREEZING;
                        _pieces[p].frigidity = POST_DROP_FRIGIDITY;    
                        this.zeroOutVelocity(p);  
                    }
                }
                
                if ( _pieces[p].frigidity > ONE )
                {
                    _pieces[p].mode = MODE_FROZEN;
                    _pieces[p].frigidity = ONE;
                    this.freeze(p);
                }
                else if ( _pieces[p].frigidity < ZERO )
                {
                    _pieces[p].frigidity = ZERO;
                }
                else
                {
                    this.updateFreezing(p);    
                }
	                               
                //--------------------------------------
                // loop through nodes
                //--------------------------------------
                for (var n=0; n<NUM_NODES_PER_PIECE; n++)
                {
                    //----------------------------------------------------
                    // friction
                    //----------------------------------------------------
                    _pieces[p].nodes[n].velocity.x *= ( ONE - FRICTION );
                    _pieces[p].nodes[n].velocity.y *= ( ONE - FRICTION );
    
                    //----------------------------------------------------
                    // gravity
                    //----------------------------------------------------
                    _pieces[p].nodes[n].velocity.y += GRAVITY;
    
                    if ( _pieces[p].mode != MODE_FROZEN )
                    {
                        //----------------------------------------------------
                        // mouse grabbing
                        //----------------------------------------------------
                        if (( p == _grab.piece )
                        &&  ( n == _grab.node  ))
                        {
                            _pieces[p].mode = MODE_DROPPED;
                            
                            _pieces[p].numCollisions = 0;
                            _pieces[p].frigidity = ZERO;
                            
                            _pieces[p].nodes[n].velocity.x += ( _mouseX - _pieces[p].nodes[n].position.x ) * GRAB_FORCE;
                            _pieces[p].nodes[n].velocity.y += ( _mouseY - _pieces[p].nodes[n].position.y ) * GRAB_FORCE;
        
                            _pieces[p].nodes[n].velocity.x *= ( ONE - GRAB_FRICTION );
                            _pieces[p].nodes[n].velocity.y *= ( ONE - GRAB_FRICTION );
                        }
                    }

                    //----------------------------------------------------
                    // update position by velocity
                    //----------------------------------------------------
                    _pieces[p].nodes[n].position.x += _pieces[p].nodes[n].velocity.x;
                    _pieces[p].nodes[n].position.y += _pieces[p].nodes[n].velocity.y;
    
                    //----------------------------------------------------
                    // collisions with other nodes
                    //----------------------------------------------------
                    this.updateNodeCollisions( p, n );
                    
                    //----------------------------------------------------
                    // collisions with walls
                    //----------------------------------------------------
                    this.updateWallCollisions( p, n );
                    
                    //----------------------------------------------------
                    // to be safe and thorough, let's re-calculate the
                    // columns rows, and grid positions at every step...
                    //----------------------------------------------------
                    this.calculateNodeGridPosition( p, n );                     
                }  
                
                //----------------------------------------------------
                // re-calculate the centroid and axis of the piece
                //----------------------------------------------------
                this.calculateCentroid(p); 
                this.calculateAxis(p);
            }
        }
	}



	//--------------------------------------------
	this.zeroOutVelocity = function( p )
	{	
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            _pieces[p].nodes[n].velocity.x = ZERO;
            _pieces[p].nodes[n].velocity.y = ZERO;
        }	
    }
    
    
	//--------------------------------------------
	this.calculateNodeGridPosition = function( p, n )
	{
        var xFraction = _pieces[p].nodes[n].position.x / WINDOW_WIDTH;
        var yFraction = _pieces[p].nodes[n].position.y / WINDOW_HEIGHT;
    
        _pieces[p].nodes[n].column = Math.floor( xFraction * NUM_TETRIS_COLUMNS );
        _pieces[p].nodes[n].row    = Math.floor( yFraction * NUM_TETRIS_ROWS    );
        
        var xGridFraction = ( _pieces[p].nodes[n].column + ONE_HALF ) / NUM_TETRIS_COLUMNS;
        var yGridFraction = ( _pieces[p].nodes[n].row    + ONE_HALF ) / NUM_TETRIS_ROWS;
            
        _pieces[p].nodes[n].gridPosition.x = xGridFraction * WINDOW_WIDTH;     
        _pieces[p].nodes[n].gridPosition.y = yGridFraction * WINDOW_HEIGHT;        
	}
	
	
	
	//--------------------------------
	this.freeze = function(p)
	{
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            _pieces[p].nodes[n].position.x = _pieces[p].nodes[n].gridPosition.x;
            _pieces[p].nodes[n].position.y = _pieces[p].nodes[n].gridPosition.y;
            _pieces[p].nodes[n].velocity.x = ZERO;
            _pieces[p].nodes[n].velocity.y = ZERO;
            
            if ( _pieces[p].nodes[n].position.y < NODE_RADIUS * 2.0 )
            {
                _gameOver = true;
            }
        }
	}



	//--------------------------------
	this.reCalculateRows = function()
	{	
	    //------------------------------------------------
	    // clear out all data.....
	    //------------------------------------------------
        for (var r=0; r<NUM_TETRIS_ROWS; r++)
        {   
            for (var c=0; c<NUM_TETRIS_COLUMNS; c++)
            {
                _rows[r].filled[c] = false;            
            }
        }

	    //------------------------------------------------
	    // determine the filled-in parts of each row...
	    //------------------------------------------------
        for (var p=0; p<_numPieces; p++)
        {        
            if ( _pieces[p].mode == MODE_FROZEN )
            {
                for (var n=0; n<NUM_NODES_PER_PIECE; n++)
                {
                    if (( _pieces[p].nodes[n].row    > NULL_ROW )
                    &&  ( _pieces[p].nodes[n].row    < NUM_TETRIS_ROWS )
                    &&  ( _pieces[p].nodes[n].column > NULL_COLUMN )
                    &&  ( _pieces[p].nodes[n].column < NUM_TETRIS_COLUMNS ))
                    {
                        //-------------------------------------------
                        //  set the node as filled...
                        //-------------------------------------------
                        _rows[ _pieces[p].nodes[n].row ].filled[ _pieces[p].nodes[n].column ] = true;            
                    }
                }
            }   	
	    }

	    //---------------------------------------------------------------
	    // determine if any row is completely filled, then remove it
	    //---------------------------------------------------------------
        for (var r=0; r<NUM_TETRIS_ROWS; r++)
        {   
            var numCellsFilled = 0;
            
            for (var c=0; c<NUM_TETRIS_COLUMNS; c++)
            {
                if ( _rows[r].filled[c] )
                {
                    numCellsFilled ++;
                }
            }
            
            if ( numCellsFilled == NUM_TETRIS_COLUMNS )
            {
                this.removeRow(r);
                this.updateReincarnatingPieces();
            }            
        }
	}
	
	
	//-----------------------------------------
	this.updateReincarnatingPieces = function()
	{	
        for (var p=0; p<_numPieces; p++)
        {        
            var numNodesBelowThreshold = 0;
            for (var n=0; n<NUM_NODES_PER_PIECE; n++)
            {
                if ( _pieces[p].nodes[n].position.y > WINDOW_HEIGHT)
                {
                    numNodesBelowThreshold ++;
                }
            }
            
            if ( numNodesBelowThreshold >= NUM_NODES_PER_PIECE )
            {
                //console.log( "piece " + p + " must be reincarnated" );

        	    //this.copyPiece( p, _numPieces - 1 );    

                //_numPieces --;
                //console.log( "_numPieces set to " + _numPieces );
            }
        }
    }
    

	//---------------------------------------
	this.copyPiece = function( p1, p2 )
	{	   
        console.log( "copy the data from " + p1 + " to " + p2 );
	
	    _pieces[p2].numCollisions  = _pieces[p1].numCollisions;
	    _pieces[p2].frigidity      = _pieces[p1].frigidity;
	    _pieces[p2].stressed       = _pieces[p1].stressed;
	    _pieces[p2].mode           = _pieces[p1].mode;
	    _pieces[p2].color          = _pieces[p1].color;
	    _pieces[p2].position       = _pieces[p1].position;
	    _pieces[p2].axis           = _pieces[p1].axis;
	    _pieces[p2].type           = _pieces[p1].type;
	    _pieces[p2].axisNode       = _pieces[p1].axisNode;
	    _pieces[p2].nodes          = _pieces[p1].nodes;
	    _pieces[p2].springs        = _pieces[p1].springs;
	
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
	        _pieces[p2].nodes[n].position       = _pieces[p1].nodes[n].position;
	        _pieces[p2].nodes[n].velocity       = _pieces[p1].nodes[n].velocity;
	        _pieces[p2].nodes[n].gridPosition   = _pieces[p1].nodes[n].gridPosition;
	        _pieces[p2].nodes[n].column         = _pieces[p1].nodes[n].column;
	        _pieces[p2].nodes[n].row            = _pieces[p1].nodes[n].row;
        }
            
        for (var s=0; s<NUM_SPRINGS_PER_PIECE; s++)
        {
            _pieces[p2].springs[s].length = _pieces[p1].springs[s].length;
            _pieces[p2].springs[s].node1  = _pieces[p1].springs[s].node1;
            _pieces[p2].springs[s].node2  = _pieces[p1].springs[s].node2;
        }    
    }
    
    
    
	//--------------------------------
	this.updateFreezing = function(p)
	{	   
        if ( _pieces[p].mode == MODE_FREEZING )
        {
            _pieces[p].frigidity += FREEZING_RATE;
        }
	
        var torqueForce = ZERO;
        
        var xAbs = Math.abs( _pieces[p].axis.x );
        var yAbs = Math.abs( _pieces[p].axis.y );
        
        if ( yAbs > xAbs )
        {
            torqueForce = -_pieces[p].axis.x;
            
            if ( _pieces[p].axis.y < ZERO )
            {
                torqueForce *= -ONE;
            }
        }
        else
        {
            torqueForce = _pieces[p].axis.y;
            
            if ( _pieces[p].axis.x < ZERO )
            {
                torqueForce *= -ONE;
            }
        }
        
        this.spin( p, torqueForce * ORTHOGONAL_FORCE * _pieces[p].frigidity );
        
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {
            //--------------------------------------
            // force towards grid 
            //--------------------------------------
            var xDifference = _pieces[p].nodes[n].position.x - _pieces[p].nodes[n].gridPosition.x;
            var yDifference = _pieces[p].nodes[n].position.y - _pieces[p].nodes[n].gridPosition.y;
    
            var columnForce = xDifference * _pieces[p].frigidity * GRID_FORCE;
            var rowForce    = yDifference * _pieces[p].frigidity * GRID_FORCE;
    
            _pieces[p].nodes[n].velocity.x -= columnForce;
            _pieces[p].nodes[n].velocity.y -= rowForce;
            
            //--------------------------------------
            // freezing friction
            //--------------------------------------
            _pieces[p].nodes[n].velocity.x *= ( ONE - _pieces[p].frigidity * SETTLE_FRICTION );
            _pieces[p].nodes[n].velocity.y *= ( ONE - _pieces[p].frigidity * SETTLE_FRICTION );
        }
 	}
	

	//---------------------------------------------
	this.updateSpringForces = function(p)
	{	
        for (var s=0; s<NUM_SPRINGS_PER_PIECE; s++)
        {
            var n1 = _pieces[p].springs[s].node1;
            var n2 = _pieces[p].springs[s].node2;
            
            var xx = _pieces[p].nodes[n2].position.x - _pieces[p].nodes[n1].position.x;
            var yy = _pieces[p].nodes[n2].position.y - _pieces[p].nodes[n1].position.y;

            var currentLength = Math.sqrt( xx * xx + yy*yy );
            
            if ( currentLength > ZERO )
            {
                var diff = _pieces[p].springs[s].length - currentLength;
                var amplidute      = diff * SPRING_TENSION;
                var relaxAmplidute = diff * RELAXATION;
                
                var xDir = xx / currentLength;
                var yDir = yy / currentLength;
    
                _pieces[p].nodes[n1].velocity.x -= xDir * amplidute;
                _pieces[p].nodes[n1].velocity.y -= yDir * amplidute;
    
                _pieces[p].nodes[n2].velocity.x += xDir * amplidute;
                _pieces[p].nodes[n2].velocity.y += yDir * amplidute;

                //----------------------------------------------------
                // relaxation
                //----------------------------------------------------
                _pieces[p].nodes[n1].position.x -= xDir * relaxAmplidute;
                _pieces[p].nodes[n1].position.y -= yDir * relaxAmplidute;
    
                _pieces[p].nodes[n2].position.x += xDir * relaxAmplidute;
                _pieces[p].nodes[n2].position.y += yDir * relaxAmplidute;
            }
        }
    }

	//--------------------------------------------
	this.updateNodeCollisions = function( p, n )
	{
        for (var op=0; op<_numPieces; op++)
        {        
            if ( op != p )
            {
                for (var on=0; on<NUM_NODES_PER_PIECE; on++)
                {
                    var xx = _pieces[p].nodes[n].position.x - _pieces[op].nodes[on].position.x;
                    var yy = _pieces[p].nodes[n].position.y - _pieces[op].nodes[on].position.y;
                    var distance = Math.sqrt( xx*xx + yy*yy );
                    if ( distance < NODE_RADIUS * 2.0 )
                    {
                        if ( distance < NODE_RADIUS * STRESS_LIMIT )
                        {
                            _pieces[p].stressed = true;
                        }
                        else
                        {
                            _pieces[p].stressed = false;
                        }
                        
                        var xForce = xx / distance * COLLISION_FORCE;
                        var yForce = yy / distance * COLLISION_FORCE;
                        
                        _pieces[ p].nodes[ n].velocity.x += xForce; 
                        _pieces[ p].nodes[ n].velocity.y += yForce; 
                        _pieces[op].nodes[on].velocity.x -= xForce; 
                        _pieces[op].nodes[on].velocity.y -= yForce; 

                        _pieces[ p].nodes[ n].velocity.x *= ( ONE - COLLISION_FRICTION ); 
                        _pieces[ p].nodes[ n].velocity.y *= ( ONE - COLLISION_FRICTION ); 
                        _pieces[op].nodes[on].velocity.x *= ( ONE - COLLISION_FRICTION ); 
                        _pieces[op].nodes[on].velocity.y *= ( ONE - COLLISION_FRICTION ); 
                        
                        if ((  p != _grab.piece )
                        &&  ( op != _grab.piece ))
                        {
                            if (( _pieces[p].mode == MODE_FALLING )
                            ||  ( _pieces[p].mode == MODE_DROPPED ))
                            {
//if (( _pieces[p].nodes[n].column == _pieces[op].nodes[on].column )
//&&  ( _pieces[p].nodes[n].row    <  _pieces[op].nodes[on].row    ))
                                {
                                    _pieces[p].numCollisions ++;                        
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
	
	//---------------------------------------------
	this.updateWallCollisions = function( p, n )
	{
        if ( _pieces[p].nodes[n].position.x > WINDOW_WIDTH - NODE_RADIUS )
        {
            _pieces[p].nodes[n].position.x = WINDOW_WIDTH - NODE_RADIUS;
            if ( _pieces[p].nodes[n].velocity.x > ZERO )
            {
                _pieces[p].nodes[n].velocity.x -= BOUNCE;
            }
        }
        else if ( _pieces[p].nodes[n].position.x < NODE_RADIUS )
        {
            _pieces[p].nodes[n].position.x = NODE_RADIUS;

            if ( _pieces[p].nodes[n].velocity.x < ZERO )
            {
                _pieces[p].nodes[n].velocity.x += BOUNCE;
            }
        }

        if ( _pieces[p].nodes[n].position.y > WINDOW_HEIGHT- NODE_RADIUS )
        {
            if (( _pieces[p].mode == MODE_FALLING )
            ||  ( _pieces[p].mode == MODE_DROPPED ))
            {
                _pieces[p].numCollisions ++;
            }

            _pieces[p].nodes[n].position.y = WINDOW_HEIGHT - NODE_RADIUS;
            
            if ( _pieces[p].nodes[n].velocity.y > ZERO )
            {
                _pieces[p].nodes[n].velocity.y -= BOUNCE;
            }
        }

        if ( _pieces[p].nodes[n].position.y < UPPER_BUFFER )
        {
            _pieces[p].nodes[n].position.y = UPPER_BUFFER;
            if ( _pieces[p].nodes[n].velocity.y < ZERO )
            {
                _pieces[p].nodes[n].velocity.y += BOUNCE;
            }
        }
	}
	
	
	//------------------------
	this.renderGame = function()
	{		
		//-------------------------------------------
		// clear the screen
		//-------------------------------------------
		canvas.fillStyle = "rgba( 0, 0, 0, " + ( 1.0 - MOTION_BLUR ) + " )";
		canvas.fillRect( 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT );		
        
		//-------------------------------------------
		// draw tetris pieces
		//-------------------------------------------
        for (var p=0; p<_numPieces; p++)
        {
            this.renderPiece(p);
        }

        if ( SHOW_ROWS )
        {
    		//-------------------------------------------
	    	// draw rows
		    //-------------------------------------------
		    this.showRows();
        }
        
        
		//-------------------------------------------
		// show score
		//-------------------------------------------
        var scoreString = _score.toString();     
        canvas.fillStyle = "rgb( 120, 120, 120 )";
        canvas.font = "20px Arial";
        canvas.fillText( scoreString, 10, 30 );        
        
        /*
		//-------------------------------------------
		// show num pieces
		//-------------------------------------------
        var scoreString = _numPieces.toString();     
        canvas.fillStyle = "rgb( 120, 120, 120 )";
        canvas.font = "20px Arial";
        canvas.fillText( scoreString + " pieces", 120, 30 );        
        */
        
		//-------------------------------------------
		// draw frame
		//-------------------------------------------
        canvas.lineWidth = 1; 		
		canvas.strokeStyle = "rgb( 150, 150, 150 )";
		canvas.strokeRect( 1, 1, WINDOW_WIDTH - 2, WINDOW_HEIGHT - 2 );		
    }
    
    

	//----------------------------
	this.showRows = function()
	{		 
        for (var r=0; r<NUM_TETRIS_ROWS; r++)
        {
            var y = ( ( r + ONE_HALF ) / NUM_TETRIS_ROWS ) * WINDOW_HEIGHT;

            for (var c=0; c<NUM_TETRIS_COLUMNS; c++)
            {
                if ( _rows[r].filled[c] )
                {
                    var x = ( ( c + ONE_HALF ) / NUM_TETRIS_COLUMNS ) * WINDOW_WIDTH;
                    canvas.fillStyle = "rgb( 0, 0, 0 )";        
                    canvas.beginPath();
                    canvas.arc( x, y, NODE_RADIUS * 0.2, 0, Math.PI * 2, false );          
                    canvas.fill();
                    canvas.closePath();	

                    canvas.lineWidth = 2; 		
                    canvas.strokeStyle = "rgb( 200, 200, 200 )";        
                    canvas.beginPath();
                    canvas.arc( x, y, NODE_RADIUS * 0.2, 0, Math.PI * 2, false );          
                    canvas.stroke();
                    canvas.closePath();	
                }
            }		            
        }	
	}
	
	
	//----------------------------
	this.renderPiece = function(p)
	{		      
	    //---------------------------------------------
	    // render nodes
	    //---------------------------------------------
        this.renderNodes( p );
            
	    //---------------------------------------------
	    // show physics
	    //---------------------------------------------
        if ( SHOW_PHYSICS ) 
        {
            //---------------------------------------------
            // show axis
            //---------------------------------------------
            canvas.strokeStyle = "rgb( 255, 255, 255 )";
            canvas.beginPath();
            canvas.moveTo( _pieces[p].position.x, _pieces[p].position.y );
            canvas.lineTo
            ( 
                _pieces[p].position.x + _pieces[p].axis.x * NODE_RADIUS * 4.0, 
                _pieces[p].position.y + _pieces[p].axis.y * NODE_RADIUS * 4.0 
            );
    
            canvas.closePath();
            canvas.stroke();            
            
        
            //--------------------------------------
            // show springs
            //--------------------------------------
            canvas.lineWidth = 2; 		
            canvas.strokeStyle = "rgb( 200, 200, 200 )";
            for (var s=0; s<NUM_SPRINGS_PER_PIECE; s++)
            {                
                var n1 = _pieces[p].springs[s].node1;
                var n2 = _pieces[p].springs[s].node2;
        
                canvas.beginPath();
                canvas.moveTo( _pieces[p].nodes[n1].position.x, _pieces[p].nodes[n1].position.y );
                canvas.lineTo( _pieces[p].nodes[n2].position.x, _pieces[p].nodes[n2].position.y );
                canvas.stroke();            
            }

            //--------------------------------------
            // show centroid
            //--------------------------------------
            canvas.fillStyle = "rgb( 200, 200, 200 )";        
            canvas.beginPath();
            canvas.arc
            ( 
                _pieces[p].position.x, 
                _pieces[p].position.y, 
                NODE_RADIUS * 0.3, 
                0, 
                Math.PI * 2, 
                false 
            );
        
            canvas.fill();
            canvas.closePath();	
        }
    }


    
	//---------------------------------
	this.renderNodes = function( p )
	{  
        var perpX =  _pieces[p].axis.y;
        var perpY = -_pieces[p].axis.x;
        
        var nr  = NODE_RADIUS * 1.0;
        var nax = nr * _pieces[p].axis.x;
        var nay = nr * _pieces[p].axis.y;
        var npx = nr * perpX;
        var npy = nr * perpY;
        
        for (var n=0; n<NUM_NODES_PER_PIECE; n++)
        {          
            canvas.fillStyle = _pieces[p].color;  

            if ( _pieces[p].mode != MODE_FROZEN )
            {
                if (( p == _grab.piece )
                &&  ( n == _grab.node  ))
                {
                    canvas.fillStyle = "rgb( 200, 200, 200 )";
                }
            }

            var upperLeftX  = _pieces[p].nodes[n].position.x - nax + npx;          
            var upperLeftY  = _pieces[p].nodes[n].position.y - nay + npy;          
            var upperRightX = _pieces[p].nodes[n].position.x + nax + npx;          
            var upperRightY = _pieces[p].nodes[n].position.y + nay + npy;          
            
            var lowerLeftX  = _pieces[p].nodes[n].position.x - nax - npx;          
            var lowerLeftY  = _pieces[p].nodes[n].position.y - nay - npy;          
            var lowerRightX = _pieces[p].nodes[n].position.x + nax - npx;          
            var lowerRightY = _pieces[p].nodes[n].position.y + nay - npy;          
            
            canvas.beginPath();
            canvas.moveTo( upperLeftX,  upperLeftY  );
            canvas.lineTo( upperRightX, upperRightY );
            canvas.lineTo( lowerRightX, lowerRightY );
            canvas.lineTo( lowerLeftX,  lowerLeftY  );
            canvas.closePath();
            canvas.fill();            

            canvas.lineWidth = 3; 		
            var h = NODE_RADIUS * 0.1;
            
            var color0 = "rgba( 0, 0, 0, 0.0 )";
            var color1 = "rgba( 0, 0, 0, 0.0 )";
            var color2 = "rgba( 0, 0, 0, 0.0 )";
            var color3 = "rgba( 0, 0, 0, 0.0 )";
            
            var alpha = 0.4;
            
            if ( _pieces[p].axis.y > 0.1 ) 
            {   
                color0 = "rgba( 255, 255, 255, " +  _pieces[p].axis.y * alpha + ")";
                color2 = "rgba(   0,   0,   0, " +  _pieces[p].axis.y * alpha + ")"; 
            }
            else if ( _pieces[p].axis.y < -0.1 ) 
            {   
                color0 = "rgba(   0,   0,   0, " + -_pieces[p].axis.y * alpha + ")"; 
                color2 = "rgba( 255, 255, 255, " + -_pieces[p].axis.y * alpha + ")"; 
            }

            if ( _pieces[p].axis.x > 0.1 ) 
            { 
                color1 = "rgba(   0,   0,   0, " +  _pieces[p].axis.x * alpha + ")"; 
                color3 = "rgba( 255, 255, 255, " +  _pieces[p].axis.x * alpha + ")";
            }
            else if ( _pieces[p].axis.x < -0.1 ) 
            { 
                color1 = "rgba( 255, 255, 255, " + -_pieces[p].axis.x * alpha + ")"; 
                color3 = "rgba(   0,   0,   0, " + -_pieces[p].axis.x * alpha + ")";                
            }
            
            canvas.strokeStyle = color0;
            canvas.beginPath();
            canvas.moveTo( upperLeftX  + h * _pieces[p].axis.x - h * perpX, upperLeftY  + h * _pieces[p].axis.y - h * perpY );
            canvas.lineTo( lowerLeftX  + h * _pieces[p].axis.x + h * perpX, lowerLeftY  + h * _pieces[p].axis.y + h * perpY );
            canvas.closePath();
            canvas.stroke();  

            canvas.strokeStyle = color1;
            canvas.beginPath();
            canvas.moveTo( lowerLeftX  + h * _pieces[p].axis.x + h * perpX, lowerLeftY  + h * _pieces[p].axis.y + h * perpY );
            canvas.lineTo( lowerRightX - h * _pieces[p].axis.x + h * perpX, lowerRightY - h * _pieces[p].axis.y + h * perpY );
            canvas.closePath();
            canvas.stroke();  
            
            canvas.strokeStyle = color2;
            canvas.beginPath();
            canvas.moveTo( upperRightX - h * _pieces[p].axis.x - h * perpX, upperRightY - h * _pieces[p].axis.y - h * perpY );
            canvas.lineTo( lowerRightX - h * _pieces[p].axis.x + h * perpX, lowerRightY - h * _pieces[p].axis.y + h * perpY );            
            canvas.closePath();
            canvas.stroke();            
            
            canvas.strokeStyle = color3;
            canvas.beginPath();
            canvas.moveTo( upperLeftX  + h * _pieces[p].axis.x - h * perpX, upperLeftY  + h * _pieces[p].axis.y - h * perpY );
            canvas.lineTo( upperRightX - h * _pieces[p].axis.x - h * perpX, upperRightY - h * _pieces[p].axis.y - h * perpY );
            canvas.closePath();
            canvas.stroke();  

            canvas.lineWidth = 1; 		
            canvas.strokeStyle = "rgba( 0, 0, 0, 0.4 )";
            canvas.beginPath();
            canvas.moveTo( upperLeftX,  upperLeftY  );
            canvas.lineTo( upperRightX, upperRightY );
            canvas.lineTo( lowerRightX, lowerRightY );
            canvas.lineTo( lowerLeftX,  lowerLeftY  );
            canvas.closePath();
            canvas.stroke();  
            
            
            //--------------------------------------
            // show stressed
            //--------------------------------------
            if ( _pieces[p].stressed )
            {
                canvas.fillStyle = "rgb( 0, 0, 0 )";       
                canvas.beginPath();
                canvas.arc
                ( 
                    _pieces[p].nodes[n].position.x, 
                    _pieces[p].nodes[n].position.y, 
                    NODE_RADIUS * 0.8, 
                    0, 
                    Math.PI * 2, 
                    false 
                );
            
                canvas.fill();
                canvas.closePath();	                  
            }

            //--------------------------------------
            // show frozen
            //--------------------------------------
            if ( _pieces[p].mode == MODE_FROZEN )
            {
                canvas.lineWidth = 2; 		
                canvas.strokeStyle = "rgba( 0, 0, 0, 0.1 )";   

                canvas.beginPath();
                canvas.moveTo( upperLeftX,  upperLeftY  );
                canvas.lineTo( lowerRightX, lowerRightY );
                canvas.closePath();
                canvas.stroke();            

                canvas.beginPath();
                canvas.moveTo( lowerLeftX,  lowerLeftY  );
                canvas.lineTo( upperRightX, upperRightY );
                canvas.closePath();
                canvas.stroke();            
            }

            if ( SHOW_DROPPED )
            {
                //--------------------------------------
                // show dropped
                //--------------------------------------
                if ( _pieces[p].mode == MODE_DROPPED )
                {
                    canvas.lineWidth = 2; 		
                    canvas.strokeStyle = "rgb( 255, 0, 0, 1.0 )";  
                    
                    var topMidX     = upperLeftX + ( upperRightX - upperLeftX ) * ONE_HALF;
                    var topMidY     = upperLeftY + ( upperRightY - upperLeftY ) * ONE_HALF;
                    var bottomMidX  = lowerLeftX + ( lowerRightX - lowerLeftX ) * ONE_HALF;
                    var bottomMidY  = lowerLeftY + ( lowerRightY - lowerLeftY ) * ONE_HALF;
    
                    var leftMidX    = upperLeftX  + ( lowerLeftX  - upperLeftX  ) * ONE_HALF;
                    var leftMidY    = upperLeftY  + ( lowerLeftY  - upperLeftY  ) * ONE_HALF;
                    var rightMidX   = upperRightX + ( lowerRightX - upperRightX ) * ONE_HALF;
                    var rightMidY   = upperRightY + ( lowerRightY - upperRightY ) * ONE_HALF;
    
                    canvas.beginPath();
                    canvas.moveTo( topMidX,  topMidY  );
                    canvas.lineTo( bottomMidX, bottomMidY );
                    canvas.closePath();
                    canvas.stroke();            
    
                    canvas.beginPath();
                    canvas.moveTo( leftMidX,  leftMidY  );
                    canvas.lineTo( rightMidX, rightMidY );
                    canvas.closePath();
                    canvas.stroke();            
                }
            }
            
            if ( SHOW_NODE_GRID )
            {
                //--------------------------------------
                // show row and column points
                //--------------------------------------
                canvas.strokeStyle = "rgb( 200, 200, 0 )";       
                canvas.beginPath();
    
                var xf = ( _pieces[p].nodes[n].column + ONE_HALF ) / NUM_TETRIS_COLUMNS;
                var yf = ( _pieces[p].nodes[n].row    + ONE_HALF ) / NUM_TETRIS_ROWS;
    
                canvas.arc
                ( 
                    xf * WINDOW_WIDTH, 
                    yf * WINDOW_HEIGHT, 
                    NODE_RADIUS * 0.5, 
                    0, 
                    Math.PI * 2, 
                    false 
                );
            
                canvas.stroke();
                canvas.closePath();	                  
            }

            //--------------------------------------
            // show frigidity
            //--------------------------------------
            if ( _pieces[p].mode == MODE_FREEZING )
            {
                canvas.lineWidth = 1; 		
                canvas.strokeStyle = "rgb( 255, 255, 255 )";        
                canvas.beginPath();
                canvas.arc
                ( 
                    _pieces[p].nodes[n].position.x, 
                    _pieces[p].nodes[n].position.y, 
                    NODE_RADIUS * _pieces[p].frigidity, 
                    0, 
                    Math.PI * 2, 
                    false 
                );
            
                canvas.stroke();
                canvas.closePath();	      
            }    
            
            /*
            //--------------------------------------
            // show piece number
            //--------------------------------------
            var pieceString = p.toString();     
            canvas.fillStyle = "rgb( 255, 255, 255 )";
            canvas.font = "20px Arial";
            canvas.fillText
            ( 
                pieceString, 
                _pieces[p].nodes[n].position.x - 5, 
                _pieces[p].nodes[n].position.y + 5 
            );        
            */
                
            if ( SHOW_PHYSICS ) 
            {
                //---------------------------------------------
                // show node as circle
                //---------------------------------------------
                canvas.lineWidth = 1; 		
                canvas.strokeStyle = "rgb( 255, 255, 255 )";
                canvas.beginPath();
                canvas.arc( _pieces[p].nodes[n].position.x, _pieces[p].nodes[n].position.y, NODE_RADIUS, 0, Math.PI * 2, false );
                canvas.stroke();
            }

        }
    }
    
	//------------------------
	this.renderGameOver = function()
	{
		//-------------------------------------------
		// clear the screen
		//-------------------------------------------
		canvas.fillStyle = "rgb( 0, 0, 0 )";
		canvas.fillRect( 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT );	

		canvas.fillStyle = "rgb( 255, 255, 255 )";
        canvas.font = "30px Arial";
        canvas.fillText( "GAME OVER", WINDOW_WIDTH * 0.25, WINDOW_HEIGHT * ONE_HALF );	
        
        var startOverButtonWidth    = WINDOW_WIDTH  * 0.5;
        var startOverButtonHeight   = WINDOW_HEIGHT * 0.15;
        var startOverButtonLeft     = WINDOW_WIDTH  * ONE_HALF - startOverButtonWidth * ONE_HALF;
        var startOverButtonTop      = WINDOW_HEIGHT * 0.6;

		canvas.fillStyle = "rgb( 80, 80, 80 )";
		canvas.fillRect( startOverButtonLeft, startOverButtonTop, startOverButtonWidth, startOverButtonHeight );	

        canvas.lineWidth = 2; 		
		canvas.strokeStyle = "rgb( 100, 150, 200 )";
		canvas.strokeRect( startOverButtonLeft, startOverButtonTop, startOverButtonWidth, startOverButtonHeight );	

		canvas.fillStyle = "rgb( 100, 250, 90 )";
        canvas.font = "30px Arial";
        canvas.fillText( "start again!", startOverButtonLeft + 15.0, startOverButtonTop + 60.0 );		

		//-------------------------------------------
		// draw frame
		//-------------------------------------------
        canvas.lineWidth = 1; 		
		canvas.strokeStyle = "rgb( 150, 150, 150 )";
		canvas.strokeRect( 1, 1, WINDOW_WIDTH - 2, WINDOW_HEIGHT - 2 );		
	}

    
	//---------------------------------
	this.mouseDown = function( x, y )
	{  
		_mouseDown = true;

		_mouseX		= x - _leftWall;
		_mouseY     = y - _topWall;
		_lastMouseX = _mouseX;
		_lastMouseY	= _mouseY;
		
		if ( _gameOver )
		{
		    _gameOver = false;
		    this.startGame();
		}
		
		var closestDistance = 1000.0;
		
        for (var p=0; p<_numPieces; p++)
        {        
            for (var n=0; n<NUM_NODES_PER_PIECE; n++)
            {
                var xx = _mouseX - _pieces[p].nodes[n].position.x;
                var yy = _mouseY - _pieces[p].nodes[n].position.y;

                var distance = Math.sqrt( xx*xx + yy*yy );
                if ( distance < NODE_RADIUS * 2 )
                {
                    if ( distance < closestDistance )
                    {
                        closestDistance = distance;
                        _grab.active = true;
                        _grab.piece  = p;
                        _grab.node   = n;    
                    }
                }
            }            
	    } 
    }
    
	
	//--------------------------------
	this.mouseMove = function( x, y )
	{	
		_lastMouseX = _mouseX;
		_lastMouseY	= _mouseY;
		_mouseX = x - _leftWall;
		_mouseY = y - _topWall;
	}
	
	//-------------------------------
	this.mouseUp = function( x, y )
	{
		_mouseDown = false;
	
		_mouseX = x - _leftWall;
		_mouseY = y - _topWall;
		
		_grab.active = false;		
        _grab.piece  = NULL_PIECE;
        _grab.node   = NULL_NODE;
	}
	
    //-------------------------------------------
    // start this puppy
    //-------------------------------------------
	this.timer = setTimeout( "tetris.update()", MILLISECONDS_PER_UPDATE );	
}



//--------------------------------
document.onmousedown = function(e) 
{
    tetris.mouseDown( e.pageX, e.pageY );
}

//---------------------------------
document.onmousemove = function(e) 
{
    tetris.mouseMove( e.pageX, e.pageY );
}

//-------------------------------
document.onmouseup = function(e) 
{
    tetris.mouseUp( e.pageX, e.pageY );
}

