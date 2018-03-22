//////////////
(function($) {
	"use strict";

	// custom functions
	$.extend({
		coordinates: {slots:{}},
		imageScale: 1,
		imageWidth: 0,

		// init
		init: function() {
			// add point to plan
			$("<div>").appendTo("#parking-plan").addClass("point");

			// reset scale
			$.reset_image_scale();

			// init point
			$.reset_point(0, 0);
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
		},

		// reset image scale
		reset_image_scale: function() {
			$.imageScale = $.imageWidth / $("#parking-plan img").width();
		},

		// read url of selected image

		read_url: function(input, callback) {
			if (input.files && input.files[0]) {
				var reader = new FileReader();

				reader.onload = function (e) {
					if(callback) {
						callback(e.target.result);
					}
				}

				reader.readAsDataURL(input.files[0]);
			}
		}
	});

	////////////////////////////

	$(document).ready(function() {

		// upload image
		$(document).on("change", "#plan-image", function(e) {
			e.preventDefault();

			$.read_url(this, function(src) {
				$("<img>").prependTo("#parking-plan").attr("src", src);
				$("#parking-plan .no-image").remove();

				// image scale
				var planImg = $("#parking-plan").children("img");
			
				$(".wrap").addClass("loading");
				$("<img/>") // Make in memory copy of image to avoid css issues
					.attr("src", src)
					.load(function() {
						$(".wrap").removeClass("loading");
						$(".coordinates-form").addClass("active");

						$.imageWidth = this.width;
						$.init();
					});
			});
		});

		// muse mouse move event
		$(document).on("mousemove", "#parking-plan", function(e) {
			var offset = $(this).offset();
			$.reset_point(
				e.clientX - offset.left,
				e.clientY - offset.top
			);
		});
		
		$(document).on("click", "#parking-plan", function(e) {
			if($.imageWidth == 0) {
				return;
			}

			//////
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

			// increase id
			$("#incremental-id").val(parseInt(id) + 1);
		});
		
		$(document).on("click", "#remove-last-coordinate", function(e) {

			var slots = [];
			for(var i in $.coordinates.slots) {
				slots.push({
					id: i,
					val: $.coordinates.slots[i]
				});
			}

			var lastSlot = slots.pop();
			$.coordinates.slots = {};
			for(var i in slots) {
				$.coordinates.slots[slots[i].id] = slots[i].val;
			}

			// save json to textarea
			$("#coordinates").val(JSON.stringify($.coordinates));

			// reset id
			$("#incremental-id").val(lastSlot.id);
		});

			// save json
		$(document).on("click", "#download-coordinate", function(e) {
			$.save_text_as_file("Coordinates.json", $("#coordinates").val());
		});
		////////////

		$(document).on("submit", "#protection-form", function(e) {
			e.preventDefault();

			if($("#passwd").val()) {
				$(this).closest(".protection").removeClass("active");
				$(".app-wrap").addClass("active");
			}
		})
	});

	$(window).resize(function() {
		$.reset_image_scale();
	})

})(jQuery);
