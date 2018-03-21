//////////////
(function($) {
	"use strict";

	// custom functions
	$.extend({
		coordinates: {slots:{}},
		imageScale: 1,
		selectable: false,

		// init
		init: function() {
			// add point to plan
			$("<div>").appendTo("#parking-plan").addClass("point");

			// init point
			$.reset_point(0, 0);

			// loaded
			$(".wrap").addClass("loaded");
		},

		// reset point coordinate funciton
		reset_point: function(x, y) {
			x = parseInt(x) + $(document).scrollLeft();
			y = parseInt(y) + $(document).scrollTop();
	
			$("#parking-plan .point").css({
				top: y + "px",
				left: x + "px"
			});

			x = parseInt(x * $.imageScale);
			y = parseInt(y * $.imageScale);

			// reset coordinate text 
			var text = $("#coordinate").data("tpl").replace(/\{\{x\}\}/g, x).replace(/\{\{y\}\}/g, y);
			$("#coordinate").text(text);
	
			return {
				x: x,
				y: y
			};
		},

		// Saves a text string as a blob file
		save_text_as_file: function(fileNameToSaveAs, textToWrite) {
			var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
				ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
				ieEDGE = navigator.userAgent.match(/Edge/g),
				ieVer = (ie ? ie[1] : (ie11 ? 11 : (ieEDGE ? 12 : -1)));
	
			if (ie && ieVer < 10) {
				alert(raiseapp_options_var.backup_download_ie);
				console.log("No blobs on IE version < 10");
				return;
			}
	
			if (ieVer > -1) {
				// download in IE
				var textFileAsBlob = new Blob([textToWrite], {type: "text/plain"});
				window.navigator.msSaveBlob(textFileAsBlob, fileNameToSaveAs);
			} else {
				// Chrome and FF, other
				var element = document.createElement('a');
				element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToWrite));
				element.setAttribute('download', fileNameToSaveAs);
	
				element.style.display = 'none';
				document.body.appendChild(element);
	
				element.click();
	
				document.body.removeChild(element);
			}
		}
	});

	////////////////////////////

	$(document).ready(function() {
		// image scale
		var plan = $("#parking-plan"),
		planImg = plan.children("img"),
		resizedWidth = planImg.width();
	
		$("<img/>") // Make in memory copy of image to avoid css issues
			.attr("src", planImg.attr("src"))
			.load(function() {
				$.imageScale = this.width / resizedWidth;
				$.init();
			});


		// muse mouse move event
		$(document).on("mousemove", "#parking-plan", function(e) {
			if(!$.selectable) {
				var offset = $(this).offset();
				$.reset_point(
					e.clientX - offset.left,
					e.clientY - offset.top
				);
			}
		});
		
		$(document).on("click", "#parking-plan", function(e) {
			$.selectable = true;
		
			var offset = $(this).offset(),
				coordinate = $.reset_point(
					e.clientX - offset.left,
					e.clientY - offset.top
				),
				id = $("#incremental-id").val();

			if(!id) {
				return;
			}			
			
			// push data
			$.coordinates.slots[id] = [coordinate.x, coordinate.y];

			// save json to textarea
			$("#coordinates").val(JSON.stringify($.coordinates));
		});

			// save json
		$(document).on("click", "#download-coordinate", function(e) {
			$.save_text_as_file("Coordinates.json", $("#coordinates").val());
		});
		////////////
	});

})(jQuery);
