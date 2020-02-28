$(function(){
	function upload(index,file){
		var fileType=file.type.split('/');
		if(fileType[0]=='image'||true){
			if(!currentUploads.data('multiple')){
				currentUploads.parents('.uploadFiles').find('.attachImg').empty();
			}
			currentUploads.parents('.uploadFiles').find('.attachImg').append('<progress max="100" value="0" id="progress'+index+'" class="progressUploadPhoto"></progress>');
			var ajax = new XMLHttpRequest();
			ajax.upload.onprogress = function(event) {
				$('#progress'+index).prop('max', event.total);
				$('#progress'+index).prop('value', event.loaded);
			}
			ajax.onload = function() {
				try {
                    var file=JSON.parse(ajax.response);
                }catch (error) { 
                    alert('Что-то пошло не так, возможно файл превышает лимит загрузки. (50мб)');
					$('#progress'+index).remove();
                    return true;
                }
				if(file.error){
					alert(file.error);
					$('#progress'+index).remove();
					return true;
				}
				if(!currentUploads.data('multiple')){
					currentUploads.parents('.uploadFiles').find('.attachImg').empty();
				}
				var uploadfile='<img src="'+file.url+'" >';
				var videoSettings = '';
				if(fileType[0]=='video'){
					var uploadfile='<video src="'+file.url+'"  controls="true"></video>';
					videoSettings = '<div class="setting__button video__settings" data-id="'+file.id+'"><i class="fa fa-cog"></i></div>';
				}
				var arrayName = 'attach';
				if (currentUploads.data('array-name')) {
					arrayName = currentUploads.data('array-name');
				}
				var name = '';
				if (fileType[0] != 'image' && fileType[0] != 'video') {
					var uploadfile = '<div style="font-size:50px;"><i class="fa fa-file"></i></div>';
					name = '<p>' + file.real_name + '</p>';
				}
				currentUploads.parents('.uploadFiles').find('.attachImg').prepend('<div class="oneAttach" >'+uploadfile+'<input hidden="true" name="'+arrayName+'[]" value="'+file.id+'">'+videoSettings+'<div class="ui_thumb_x_button" data-id="'+file.id+'" aria-label="Не прикреплять" role="link"><div class="ui_thumb_x"></div></div>'+name+'</div>');
				$('#progress'+index).remove();
			}
			ajax.onerror = function() {
				alert('Не верный формат файла.');
			}
			var formData = new FormData();
			formData.append("upload", file);
			ajax.open("POST", currentUploads.data('url'), true);
			ajax.setRequestHeader('X-CSRF-TOKEN',$('meta[name="csrf-token"]').attr('content') );
			ajax.send(formData);
		};
	}

	$('html').on('dragover',function(e){
		if($('#modal_form_upload').length){
			e.preventDefault();
			$(this).find('.dragFile').addClass('active');
		}
	});

	$('body').on('mouseout',function(e){
		if($('#modal_form_upload').length){
			e.preventDefault();
			$(this).find('.dragFile').removeClass('active');
		}
	});

	$('html').on('drop',function(e){
		e.preventDefault();	
		$('.dragFile').removeClass('active');
	});

	$('html').on('dragover','.dragFile',function(e){
		$(this).addClass('superActive');
		$(this).find('span').text('Отпустите клавишу мыши');
	});

	$('body').on('dragleave','.dragFile',function(e){
		$(this).removeClass('superActive');
		$(this).find('span').text('Перенесите сюда файл');
	});

	$('html').on('drop','.dragFile',function(e){
		e.preventDefault();
		var files = e.originalEvent.dataTransfer.files;
		if($('#modal_form_upload').length){
			$('body').css('overflow', 'auto');
			$('#modal_form_upload')
				.animate({opacity: 0, top: '45%'}, 200,  
					function(){ 
						$(this).css('display', 'none'); 
						$('#overlay').fadeOut(400);
					});
			$('.addNewContent').animate({opacity: 0, bottom: '-35px'}, 200);
			$(this).removeClass('active');
		}
		$.each(files, function(index, file){
			upload(index, file);
		});
	});
	$('body').on('change','.attachUpload',function(){
		if($('#modal_form_upload').length){
			$('body').css('overflow', 'auto');
			$('#modal_form_upload')
				.animate({opacity: 0, top: '45%'}, 200,  
					function(){ 
						$(this).css('display', 'none'); 
						$('#overlay').fadeOut(400);
					});
			$('.addNewContent').animate({opacity: 0, bottom: '-35px'}, 200);
		}
		var files = $(this)[0].files;
		$.each(files, function(index,file){
			upload(index, file);
		});
	});

	$('body').on('click', '.ui_thumb_x_button', function(e){
		$this=$(this).parents('form').attr('id');
	   	$('[form="'+$this+'"]').prop('disabled', false);
	   	$('[form="'+$this+'"]').html("Сохранить");
    	var attach=$(this);
		setTimeout(function(){
			attach.parent().css('display','none');
			if(!attach.parent('.oneAttach').length||attach.parents('.uploadFiles').data('delete')==true){
				$.ajax({
					type: "POST",
					url: attach.data('delete-url'),
					headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
					success: function(json) {
						attach.parent().remove();
					},
					error:function(){
						attach.parent().css('display','-webkit-inline-box');
					}
				});
			}else{
				attach.parent().remove();
			}
        },100);
   	});
   	
   	$('body').on('click', '.uploadFileButton', function(e){
   		e.preventDefault();
   		currentUploads=$(this);
   		$('.oneUploadBefore').remove();

   		var $preloader = $('#modal_form_upload').find('.modal-preloader');
		 	var $spinner   = $preloader.find('.spinner');
		 	$spinner.css('display','block');
		 	$preloader.css('display','block');
		$('#modal_form_upload').remove();
   		if(!$('#modal_form_upload').length){
	   		var multiple='';
	   		if(currentUploads.data('multiple')){
		   		multiple='multiple="true"';
			}
			var acceptFormats = 'image/jpeg,image/png,image/gif,video/*';
			if(currentUploads.data('accept')){
				acceptFormats = currentUploads.data('accept');
			}
   			$('body').append('<div id="modal_form_upload"><div class="dragFile"><div class="drag_text"><span>Перенесите сюда файл</span></div></div><span id="modal_close_upload"><br></span><div class="title ">Прикрепить файл</div><input name="attach" type="file" class="attachUpload" accept="'+acceptFormats+'" '+multiple+' hidden="true"><div class="button-upload"><i>+</i>Загрузить файл</div><div class="beforeUploads"><div class="modal-preloader" "><span class="spinner" ></span></div></div><a class="btn btn-success addNewContent" href="">Добавить</a></div> <div id="overlay"></div>');
   		}
   		$('.dragFile').removeClass('active').removeClass('superActive');
   		$('.dragFile').find('span').text('Перенесите сюда файл');
   		$('body').css('overflow', 'hidden');
   		$('#overlay').fadeIn(400, function(){
			$('#modal_form_upload') 
				.css('display', 'block')
				.animate({opacity: 1, top: '50%'}, 200);
			$.ajax({
				type: "GET",
				url: currentUploads.data('url-get'),
				success: function(json) {
					addNewContent={};
					var file=json;
					$('.oneUploadBefore').remove();
					$.each(file, function(index, file){
						var deleteUpload='';
						deleteUpload='<div class="ui_thumb_x_button" data-id="'+file['id']+'" data-delete-url="'+file['deleteUrl']+'" aria-label="Не прикреплять" role="link"><div class="ui_thumb_x"></div></div>';
						var uploadfile='<img src="'+file['url']+'" >';
						if(file['type']=='video'){
							var uploadfile='<video src="'+file['url']+'" autoplay="true" muted="true"></video>';
						}
						var name = '';
						if (file['type'] == 'file') {
							var uploadfile = '<div style="font-size:50px;"><i class="fa fa-file"></i></div>';
							name = '<p>' + file['real_name'] + '</p>';
						}
						$('.beforeUploads').prepend('<div class="oneUploadBefore" data-real-name="'+file['real_name']+'" data-type="'+file['type']+'" data-id="'+file['id']+'" data-url="'+file['url']+'">'+uploadfile+'<div class="blackopacity"></div><div class="media_check_btn"  data-type="'+file['type']+'" data-id="'+file['id']+'" data-real-name="'+file['real_name']+'" data-url="'+file['url']+'"></div>'+deleteUpload+name+'</div>');
					});
					var $preloader = $('#modal_form_upload').find('.modal-preloader');
					var $spinner   = $preloader.find('.spinner');
					$spinner.fadeOut();
					$preloader.delay(350).fadeOut('slow');
				},
				error:function(){
					
				}
			});
		});		
   	});
   	
   	$('body').on('click', '.oneUploadBefore', function(e){
	   	e.preventDefault();
	   	if(Object.keys(addNewContent).length==0){
			if(!$(this).find('.ui_thumb_x_button:hover').length&&!$(this).find('.media_check_btn:hover').length){
				if(!currentUploads.data('multiple')){
					currentUploads.parents('.uploadFiles').find('.attachImg').empty();
				}
				var uploadfile='<img src="'+$(this).data('url')+'" >';
				var videoSettings = '';
				if($(this).data('type')=='video'){
					var uploadfile='<video src="'+$(this).data('url')+'"  controls="true"></video>';
					videoSettings = '<div class="setting__button video__settings" data-id="'+$(this).data('id')+'"><i class="fa fa-cog"></i></div>';
				}
				var arrayName = 'attach';
				if (currentUploads.data('array-name')) {
					arrayName = currentUploads.data('array-name');
				}
				var name = '';
				if ($(this).data('type') != 'image' && $(this).data('type') != 'video') {
					var uploadfile = '<div style="font-size:50px;"><i class="fa fa-file"></i></div>';
					name = '<p>' + $(this).data('real-name') + '</p>';
				}
				currentUploads.parents('.uploadFiles').find('.attachImg').prepend('<div class="oneAttach">'+uploadfile+'<input hidden="true" name="'+arrayName+'[]" value="'+$(this).data('id')+'">'+videoSettings+'<div class="ui_thumb_x_button" data-id="'+$(this).data('id')+'" aria-label="Не прикреплять" role="link"><div class="ui_thumb_x"></div></div>'+name+'</div>');
				$('body').css('overflow', 'auto');
				$('#modal_form_upload')
					.animate({opacity: 0, top: '45%'}, 200,  
						function(){ 
							$(this).css('display', 'none'); 
							$('#overlay').fadeOut(400);
						});
				$('.addNewContent').animate({opacity: 0, bottom: '-35px'}, 200);
			}
		}
	});
   	
	$('body').on('click', '#modal_close_upload, #overlay', function(e){
		e.preventDefault();
		$('body').css('overflow', 'auto');
		$('#modal_form_upload')
			.animate({opacity: 0, top: '45%'}, 200, 
				function(){
					$(this).css('display', 'none'); 
					$('#overlay').fadeOut(400); 
				});
		$('.addNewContent').animate({opacity: 0, bottom: '-35px'}, 200);
	});
   	
   	$('body').on('click', '.media_check_btn', function(e){
	   	$(this).toggleClass('selected');
	   	if(!addNewContent[$(this).data('id')]){
		   	$(this).parent().find('.blackopacity').css('opacity','0.33');
		   addNewContent[$(this).data('id')]=[$(this).data('url'),$(this).data('type'),$(this).data('real-name')];
	   	}
	   	else{
		   	delete addNewContent[$(this).data('id')];
		   	$(this).parent().find('.blackopacity').css('opacity','0');
	   	}
	   	if(Object.keys(addNewContent).length==1){
	   	$('.addNewContent')
			.animate({opacity: 1, bottom: '10px'}, 200, 
				function(){ 
				});
		}else{
			if(Object.keys(addNewContent).length==0){
			$('.addNewContent')
			.animate({opacity: 0, bottom: '-35px'}, 200,  
				function(){ 
				});
			}
		}
	});
   	
   	$('body').on('click', '.addNewContent', function(e){
   		e.preventDefault();
   		$.each(addNewContent, function(index, file){
	   		if(!currentUploads.data('multiple')){
		   		currentUploads.parents('.uploadFiles').find('.attachImg').empty();
	   		}
			var uploadfile='<img src="'+file[0]+'" >';
			var videoSettings = '';
			if(file[1]=='video'){
				var uploadfile='<video src="'+file[0]+'"  controls="true"></video>';
				videoSettings = '<div class="setting__button video__settings" data-id="'+index+'"><i class="fa fa-cog"></i></div>';
			}
			var arrayName = 'attach';
			if (currentUploads.data('array-name')) {
				arrayName = currentUploads.data('array-name');
			}
			var name = '';
			if (file[1] != 'image' && file[1] != 'video') {
				var uploadfile = '<div style="font-size:50px;"><i class="fa fa-file"></i></div>';
				name = '<p>' + file[2] + '</p>';
			}
   		 	currentUploads.parents('.uploadFiles').find('.attachImg').prepend('<div class="oneAttach">'+uploadfile+'<input hidden="true" name="'+arrayName+'[]" value="'+index+'">'+videoSettings+'<div class="ui_thumb_x_button" data-id="'+index+'" aria-label="Не прикреплять" role="link"><div class="ui_thumb_x"></div></div>'+name+'</div>');
   		 	$('body').css('overflow', 'auto');
   		 	$('#modal_form_upload')
			.animate({opacity: 0, top: '45%'}, 200,  
				function(){ 
					$(this).css('display', 'none'); 
					$('#overlay').fadeOut(400);
				});
			$('.addNewContent').animate({opacity: 0, bottom: '-35px'}, 200);
		});	
	});
	   
   	$('body').on('click', '.button-upload', function(e){
   		$( ".attachUpload" ).trigger( "click" );
   	});
   	
   	$('body').on('click', '.addScan', function(e){
   		currentUploads=$(this);
   		$( ".attachUpload" ).trigger( "click" );
   	});
});