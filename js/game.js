/**
 * Catch the Cat / Turkey Game 
 * (C) Substance Design Ltd. 2009
 * @author: Glan Thomas
 **/
TurkeyGame =
{
	setup : function(settings)
	{
		this.settings = settings;
		this.cells = new Array(settings.width);
		this.cat = null
		
		for (i=0; i <this.cells.length; i++)
		{
			this.cells[i]=new Array(settings.height);
			for(var ii=0; ii<this.cells[i].length; ii++)
				this.cells[i][ii] = new Array(6);
		}
		this.restart();
	},
	
	restart : function()
	{
		document.getElementById('success1').style.display = 'none';
		document.getElementById('success2').style.display = 'none';
		document.getElementById('fail1').style.display = 'none';
		document.getElementById('fail2').style.display = 'none';
			
		// Setup hex grid connections
		// Note alternate rows skip the first item 
		for(var i=0; i<this.cells.length; i++)
		{
			for(var ii=0; ii<this.cells[i].length; ii++)
			{
				this.cells[i][ii][0] = (ii-1>=1-(i%2)) ? this.cells[i][ii-1] : null;
				this.cells[i][ii][1] = (ii+1<this.cells[i].length) ? this.cells[i][ii+1] : null;
				this.cells[i][ii][2] = (i+1<this.cells.length) ? this.cells[i+1][ii] : null;
				this.cells[i][ii][3] = (i-1>=1-(i%2)) ? this.cells[i-1][ii] : null;
				if (i%2==0)
				{
					this.cells[i][ii][4] = (i+1<this.cells.length && ii-1>=0) ? this.cells[i+1][ii-1] : null;
					this.cells[i][ii][5] = (i-1>=0 && ii-1>=1-(i%2)) ? this.cells[i-1][ii-1] : null;
				}
				else
				{
					this.cells[i][ii][4] = (i+1<this.cells.length && ii+1<this.cells[i].length) ? this.cells[i+1][ii+1] : null;
					this.cells[i][ii][5] = (i-1>=0 && ii+1<this.cells[i].length) ? this.cells[i-1][ii+1] : null;
				}
				this.cells[i][ii][6] = false;
			}
		}
	
		for(var i=0; i<this.settings.blocks; i++)
			this.cells[Math.floor(Math.random()*this.cells.length)][Math.floor(Math.random()*this.cells[0].length)][6] = true;
			
		this.cat = this.cells[Math.floor(this.cells.length/2)][Math.floor(this.cells[0].length/2)];
		this.draw();
	},

	// Draw grid and animate cat movement
	draw : function()
	{
		var grid = document.getElementById('grid');
		
		var content = '';
		
		for(var i=0; i<this.cells.length; i++)
		{
			content+='<div class="line '+((i%2==1)?'alt':'')+' '+((i==0)?'first':'')+'">';
			for(var ii= 1-(i%2); ii<this.cells[i].length; ii++)
			{
				content+='<div onmouseover="$(this).addClassName(\'hover\');" onmouseout="$(this).removeClassName(\'hover\');" onclick="TurkeyGame.block('+i+','+ii+');" '+((this.cells[i][ii] == this.cat)?'id="cat"':'')+' class="block '+((this.cells[i][ii][6])?'blocked':'')+'">';
				//content+='<span onclick="TurkeyGame.block('+i+','+ii+');"></span>';
				content+='</div>';
			}
			content+='</div>';	
		}				
		grid.innerHTML = content;
		
		// Move the cat
		if ($('cat'))
		{
			$('cat2').style.display = 'block';
			var offsets = $('cat').cumulativeOffset();
			var cat = $('cat2').cumulativeOffset();
			
			if (offsets[0] > cat[0])
			{
				$('cat2').className = 'r';
			}
			else
			{
				$('cat2').className = 'n';
			}
			
			new Effect.Move('cat2',{ x: offsets[0], y:offsets[1], mode:'absolute',duration:0.2});
		}
		else
			$('cat2').style.display = 'none';
	},	

	// onclick for grid block
	block : function(i,ii)
	{
		if ($('instructions').style.display != 'none')
			new Effect.Fade('instructions');
	
		if(this.cat)
		{
			if (!this.cells[i][ii][6])
			{
				this.cells[i][ii][6] = true;
				this.moveCat();
			}
		}
	},
	
	// cat's game turn
	moveCat : function()
	{
		var movelist = new Array();
		var cat_wins = false;
		
		// list possible moves
		for(var i=0; i<6; i++)
		{	
			if (this.cat[i] == null)
				cat_wins = true;
			else if (this.cat[i][6] == false)
				movelist[movelist.length] = this.cat[i];	
		}
		
		// does one of the moves take the cat off the grid?
		if (cat_wins)
		{
			this.cat = null;
			this.draw();
			this.showFail();
		}
		// if one or more moves posible
		else if (movelist.length > 0)
		{
			var min_depth = 100;
			var best_move = 0;
			
			// workout best move
			for(var i=0; i< movelist.length; i++)
			{
				var the_move = this.calculatePathLength(movelist[i]);
				if (the_move < min_depth)
				{
					min_depth = the_move;
					best_move = i;
				}
			}
			this.cat = movelist[best_move];
			this.draw();
			
			// is the cat on the edge off the grid, if so they win
			for(var i=0; i<6; i++)
			{
				if(this.cat[i] == null)
					cat_wins = true;
			}
			if (cat_wins)
			{
				if (!window.ActiveXObject)
					new Effect.Fade('cat2');
				this.showFail();
			}
		}
		// cat can not move, player wins
		else
		{
			this.draw();
			this.showSuccess();
		}		
	},
	
	// Calculate exit route length (breadth first search)
	calculatePathLength : function(c)
	{
		var queue = new Array();
		var visited = new Array();
		
		queue[0] = new Array();	
		queue[0].push(c);
		visited.push(c);
		
		for(var i=0; i<queue.length; i++)
		{
			if (queue[i+1] == null)
				queue[i+1] = new Array();
				
			while(queue[i].length > 0)
			{
				var cell = queue[i].pop();
				for(var ii=0; ii<6; ii++)
				{
					if (cell[ii] == null)
						return i;
					if (cell[ii][6] == false && !this.hasBeenVisited(visited,cell[ii]))
						queue[i+1].push(cell[ii]);
					visited.push(cell[ii]);
				}
			}
			if (i > 100)
			{
				this.showSuccess();
				break;
				//return Math.floor(Math.random()*6); // Return a random path weight
			}
		}
	},
			
	hasBeenVisited : function(fifo,cell)
	{
		for(var i=0; i<fifo.length; i++)
			if (fifo[i] == cell)
				return true;
		return false;
	},
	
	showSuccess : function()
	{
		document.getElementById('success1').style.top = '100px';	
		new Effect.Parallel([
			new Effect.Appear('success1'),
			new Effect.Move('success1',{x:0, y:220, mode:'absolute'})
			],{afterFinish: function() { 
				setTimeout(function()
				{
					new Effect.Parallel([
						new Effect.Fade('success1'),
						new Effect.Move('success1',{x:0, y:340, mode:'absolute'})],{afterFinish: function() { 
					new Effect.Appear('success2') }});
				},2000)
		}});
	},
	
	showFail : function()
	{
		document.getElementById('fail1').style.top = '100px';	
		new Effect.Parallel([
			new Effect.Appear('fail1'),
			new Effect.Move('fail1',{x:0, y:220, mode:'absolute'})
			],{afterFinish: function() { 
				setTimeout(function()
				{
					$('cat2').style.display = 'none';
					new Effect.Parallel([
						new Effect.Fade('fail1'),
						new Effect.Move('fail1',{x:0, y:340, mode:'absolute'})],{afterFinish: function() { 
					new Effect.Appear('fail2') }});
				},2000)
		}});
	}
}

document.observe("dom:loaded", function() { TurkeyGame.setup({width : 11, height : 11, blocks : 17}) });