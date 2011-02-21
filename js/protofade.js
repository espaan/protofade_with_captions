/**
	Protofade 1.3 18/09/09
	Copyright (c) 2009 Filippo Buratti; info [at] cssrevolt.com [dot] com; http://www.filippoburatti.net/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/**
    Adjusted by Erik Spaan, 18 Jan 2011
    - Adapted control classes with a prefix "pf-"
    - Added translatable controls strings with variables
    - Added the option of showing a caption from the ALT attribute of the images
      in 2 different styles. Options of the caption can be set with optional variables
      captionType 1: Caption fades away during image switch, is updated and appears slowly again
      captionType 2: Caption appears after an image switch and is shown for delay/2 and faded again
*/

var Protofade = Class.create({

	initialize: function(element, options) {		
		this.options = {
      		duration: 1.0,
			delay: 4.0,
			randomize: false,
			autostart:true,
			controls:false,
            controlsNext: 'Next',
            controlsPrevious: 'Previous',
            controlsStart: 'Start',
            controlsStop: 'Stop',
			eSquare:false,
			eRows: 3, 
			eCols: 5,
			eColor: '#FFFFFF',
            captionType: 0,
            captionHeight: '50px',
            captionColor: '#fff',
            captionBackground: '#000',
            captionOpacity: 0.5
    	}
		Object.extend(this.options, options || {});

    	this.element        = $(element);
		this.slides			= this.element.childElements();
		this.num_slides		= this.slides.length;		
		this.current_slide 	= (this.options.randomize) ? (Math.floor(Math.random()*this.num_slides)) : 0;
		this.end_slide		= this.num_slides - 1;
		
		this.slides.invoke('hide');
		this.slides[this.current_slide].show();

        // create and activate the caption
        if (this.options.captionType == 1 || this.options.captionType == 2) {
            this.wrapper 	    = this.element.up();
            this.caption	    = new Element('div', { 'class': 'pf-caption' });
            this.wrapper.insert(this.caption);
            this.captioncontent	= new Element('div', { 'class': 'pf-captioncontent' });
            this.caption.insert(this.captioncontent);

            //resize the width of the caption according to the image width
            this.caption.setStyle({
                'z-index': 500,
                position: 'absolute',
                backgroundColor: this.options.captionBackground,
                color: this.options.captionColor,
//                width: this.slides[this.current_slide].down('img').getWidth()+'px', 
                width: '100%', 
                height: this.options.captionHeight,
                left: 0,
                bottom: 0
            });
            this.captioncontent.setStyle({
                'z-index': 1000,
                margin: '5px 10px'
            });

            //get the caption of the first image from ALT attribute and display it
            this.captioncontent.update(this.slides[this.current_slide].down('img').readAttribute('alt'));

            //set the caption to transparent
            this.caption.setStyle({ opacity: this.options.captionOpacity });

            if (this.options.captionType == 2) {
                // fade out the caption again
                new Effect.Opacity(this.caption, { from: this.options.captionOpacity, to: 0.0, delay: this.options.delay/2, duration: this.options.duration/2 });
            }
        }

        if (this.options.autostart) { 
			this.startSlideshow();
		}				
		if (this.options.controls) {
			this.addControls();
		}
		if (this.options.eSquare) {
			this.buildEsquare();
		}
	},
	
	addControls: function() {
		this.wrapper 		= this.element.up();
		this.controls		= new Element('div', { 'class': 'pf-controls' });
		this.wrapper.insert(this.controls);
		
		this.btn_next 		= new Element('a', { 'class': 'pf-next', 'title': this.options.controlsNext, href: '#' }).update(this.options.controlsNext);
		this.btn_previous	= new Element('a', { 'class': 'pf-previous', 'title': this.options.controlsPrevious, href: '#' }).update(this.options.controlsPrevious);
		this.btn_start		= new Element('a', { 'class': 'pf-start', 'title': this.options.controlsStart, href: '#' }).update(this.options.controlsStart);
		this.btn_stop		= new Element('a', { 'class': 'pf-stop', 'title': this.options.controlsStop, href: '#' }).update(this.options.controlsStop);
		
		this.btns = [this.btn_previous, this.btn_next, this.btn_start, this.btn_stop];
		this.btns.each(function(el){
			this.controls.insert(el);
		}.bind(this));
		
		this.btn_previous.observe('click', this.moveToPrevious.bindAsEventListener(this));
		this.btn_next.observe('click', this.moveToNext.bindAsEventListener(this));
		this.btn_start.observe('click', this.startSlideshow.bindAsEventListener(this));
		this.btn_stop.observe('click', this.stopSlideshow.bindAsEventListener(this));
	},
	
	buildEsquare: function() {		
		this.eSquares 	= [];
		var elDimension	 	= this.element.getDimensions();
		var elWidth  		= elDimension.width;
		var elHeight 		= elDimension.height;
				
		var sqWidth 		= elWidth / this.options.eCols;
		var sqHeight 		= elHeight / this.options.eRows;
	
		$R(0, this.options.eCols-1).each(function(col) {
			this.eSquares[col] = [];							 	
			$R(0, this.options.eRows-1).each(function(row) {
				var sqLeft = col * sqWidth;
			    var sqTop  = row * sqHeight;
				this.eSquares[col][row] = new Element('div').setStyle({
 														    opacity: 0, backgroundColor: this.options.eColor,
															position: 'absolute', 'z-index': 5,
															left: sqLeft + 'px', top: sqTop + 'px',
															width: sqWidth + 'px', height: sqHeight + 'px'		
														});
				this.element.insert(this.eSquares[col][row]);				 							 										 
			}.bind(this))
		}.bind(this));			
	},

	startSlideshow: function(event) {
		if (event) { Event.stop(event); }
		if (!this.running)	{
			this.executer = new PeriodicalExecuter(function(){
	  			this.updateSlide(this.current_slide+1);
	 		}.bind(this),this.options.delay);
			this.running=true;
		}
	},
	
	stopSlideshow: function(event) {	
		if (event) { Event.stop(event); } 
		if (this.executer) { 
			this.executer.stop();
			this.running=false;
		}	 
	},

	moveToPrevious: function (event) {
		if (event) { Event.stop(event); }
		this.stopSlideshow();
  		this.updateSlide(this.current_slide-1);
	},

	moveToNext: function (event) {
		if (event) { Event.stop(event); }
		this.stopSlideshow();
  		this.updateSlide(this.current_slide+1);
	},
	
	updateSlide: function(next_slide) {		
		if (next_slide > this.end_slide) { 
			next_slide = 0; 
		} 
		else if ( next_slide == -1 ) {
			next_slide = this.end_slide;
		}	
		this.fadeInOut(next_slide, this.current_slide);		
	},

    updateCaption: function () {
        this.captioncontent.update(this.nextImage.readAttribute('alt'));
        new Effect.Opacity(this.caption, { from: 0.0, to: this.options.captionOpacity, duration: this.options.duration });
    },
    
 	fadeInOut: function (next, current) {		
		new Effect.Parallel([
			new Effect.Fade(this.slides[current], { sync: true }),
			new Effect.Appear(this.slides[next], { sync: true })
  		], { duration: this.options.duration });

        if (this.options.captionType == 1) {
            this.nextImage = this.slides[next].down('img');
            new Effect.Opacity(this.caption, { from: this.options.captionOpacity, to: 0.0, duration: this.options.duration, 
                afterFinish: this.updateCaption.bind(this)
            } )
        } else if (this.options.captionType == 2) {
            this.captioncontent.update(this.slides[next].down('img').readAttribute('alt'));
            new Effect.Opacity(this.caption, { from: 0.0, to: this.options.captionOpacity, duration: this.options.duration/2 });
            new Effect.Opacity(this.caption, { from: this.options.captionOpacity, to: 0.0, delay: this.options.delay/2, duration: this.options.duration/2 });
        }

		if (this.options.eSquare) {			
			$R(0, this.options.eCols-1).each(function(col) {	 						 	
				$R(0, this.options.eRows-1).each(function(row) {
					var eSquare = this.eSquares[col][row];
					var delay = Math.random() * 150;				
					setTimeout(this.delayedAppear.bind(this, eSquare), delay);
				}.bind(this))
			}.bind(this));	
		}
		
		this.current_slide = next;		
	},
	
	delayedAppear: function(eSquare)	{
		var opacity = Math.random();
		new Effect.Parallel([ 
			new Effect.Appear ( eSquare, { from: 0, to: opacity, duration: this.options.duration/4 } ),
			new Effect.Appear ( eSquare, { from: opacity, to: 0, duration: this.options.duration/1.25} )
		], { sync: false });			
	}

});