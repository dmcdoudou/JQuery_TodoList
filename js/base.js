;(function() {
	"use strict";
	
	var $form_add_task = $('.add-task')
		,$window = $(window)
		,$body = $('body')
		,$task_delete_trigger
		,$task_detail_trigger
		,$task_detail = $('.task-detail')
		,$task_detail_mask = $('.task-detail-mask')
		,task_list = []
		,current_index
		,$update_form
		,$task_detail_content
		,$task_detail_content_input
		,$checkbox_complete
		,$task_item
		,$msg = $('.msg')
		,$msg_content = $msg.find('.msg-content')
		,$msg_confirm = $msg.find('.confirmed')
		,$alerter = $('.alerter');
		;

	init();	

	$form_add_task.on('submit',on_add_task_form_submit);	
	$task_detail_mask.on('click',hide_task_detail);

	function pop(arg) {
		if (!arg) {
			console.error('pop title is required');
		}

		var conf = {}
			, $box
			, $mask
			, $title
			, $content
			, $confirm
			, $cancel
			, timer			
			, dfd
			, confirmed
			;

		//返回一个defered对象
		dfd = $.Deferred();
		//dfd.resolve();
		//dfd.promise();

		//定义标题
		if (typeof arg == 'string')
			conf.title = arg;
		else
			/*conf是旧值*/
			conf = $.extend(conf,arg);

		$box = $('<div>'+
			'<div class="pop-title">'+conf.title+'</div>'+
			'<div class="pop-content">'+
			'<div>'+
			'<button style="margin-right: 8px;" class="primary confirm">确定</button>'+
			'<button class="cancel">取消</button>'+
			'</div>'+
			'</div>')
			.css({
				position: 'fixed',
				color: '#444',
				width: 300,
				height: 'auto',
				padding: '23px 10px',
				background: '#fff',
				'border-radius': '3px',
				'-webkit-box-shadow': '0 1px 2px rgba(0,0,0,.5)',
	   			 '-moz-box-shadow': '0 1px 2px rgba(0,0,0,.5)',
	              'box-shadow': '0 1px 2px rgba(0,0,0,.5)'
			})

		$title = $box.find('.pop-title').css({
			padding: '5px 10px',
			'font-weight': 900,
			'font-size': 20,
			'text-align': 'center'

		})	

		$content = $box.find('.pop-content').css({
			padding: '5px 10px',
			'text-align': 'center'
		})

		$confirm = $content.find('button.confirm');
		$cancel = $content.find('button.cancel');

    $mask = $('<div></div>')
    	.css({
    		position: 'fixed',
    		top: 0,
    		bottom: 0,
    		left: 0,
    		right: 0,
    		'background-color': 'rgba(0,0,0,.5)'
    	})

    timer = setInterval(function() {
    	if (confirmed !== undefined) {
    		dfd.resolve(confirmed);
    		clearInterval(timer);
    		dismiss_pop();
    	}
    },50)

    //这步操作是异步的，用户何时点击是不清楚的	
 		$confirm.on('click',on_confirm)	   	

 		$cancel.on('click',on_cancel);	 
		$mask.on('click',on_cancel);

		function on_confirm() {
 			confirmed = true;
 		}

		function on_cancel() {
 			confirmed = false;
		}

 		function dismiss_pop() {
 			$mask.remove();
 			$box.remove();
 		} 		
		
		function adjust_box_position() {
			var window_width = $window.width()
				, window_height = $window.height()
				, box_width = $box.width()
				, box_height = $box.height()
				, move_x
				, move_y
				;
			
			move_x = (window_width - box_width)/2;
			move_y = (window_height - box_height)/2 - 50;

			$box.css({
				left: move_x,
				top: move_y
			})
		}

		$window.on('resize',function() {
			adjust_box_position();
		})

    $mask.appendTo($body);
		$box.appendTo($body);
		$window.resize();
		return dfd.promise();
	}

	function listen_msg_event() {
		$msg_confirm.on('click',function() {
			hide_msg();
		})
	}

	function on_add_task_form_submit(e) {
		var new_task = {};
		var $input = $(this).find('input[name=content]');
		/*禁用submit行为*/
		e.preventDefault();
		new_task.content = $input.val();
		if(!new_task.content) return;
		/*存入新task*/
		if (add_task(new_task)) {
			//render_task_list();
			$input.val('');
		};
	}

	/*查找并监听所有详情按钮的点击事件*/
	function listen_task_detail() {
		$task_detail_trigger.on('click',function() {
			var $this = $(this);
			var $item = $this.parent().parent();
			var index = $item.data('index');
			show_task_detail(index);
		})
		$task_item.on('dblclick',function() {
			var index = $(this).data('index');
			show_task_detail(index);
		})	
	}

	/**/

	/*监听完成Task事件*/
	function listen_checkbox_complete() {
		$checkbox_complete.on('click',function() {
			//console.log($(this).is(':checked'));
			var $this = $(this);
			var index = $this.parent().parent().data('index');
			var item = get(index);
			if (item.complete)
				update_task(index,{complete: false});
			else
				update_task(index,{complete: true});
		})
	}

	function get(index) {
		return store.get('task_list')[index];
	}

	/*查看Task详情*/
	function show_task_detail(index) {
		render_task_detail(index);
		current_index = index;
		$task_detail.show();
		$task_detail_mask.show();
	}

	/*把详情页里的数据保存在localstorage中*/
	function update_task(index,data) {
		if (index === undefined || !task_list[index]) return;

		//data是一个对象，数组合并使用$.merge()，对象合并使用extend
		//{}空数据,task_list[index]旧数据,data新数据
		task_list[index] = $.extend({},task_list[index],data);
		//console.log(store.get('task_list')[index]);
		refresh_task_list();
	}

	function hide_task_detail() {
		$task_detail.hide();
		$task_detail_mask.hide();
	}	

	/*渲染指定task的详细信息*/
	function render_task_detail(index) {
		if (index === undefined || !task_list[index]) return;

		var item = task_list[index];
		//console.log(item);
		var tpl = '<form>'+
			'<div class="content">'+
			item.content+
			'</div>'+
			'<div><input style="display: none;" type="text" name="content" value='+
			(item.content||'')+'></div>'+
			'<div>'+
			'<div class="desc">'+
			'<textarea name="desc">'+(item.desc||'')+'</textarea>'+
			'</div>'+
			'</div>'+
			'<div class="remind">'+
			'<label>提醒时间</label>'+			
			'<input class="datetime" name="remind_date" type="text" autocomplete="off" value="'+(item.remind_date||'')+'">'+
			'</div>'+	
			'<div><button type="submit">更新</button></div>'+
			'</form>';

		/*用新模板替换旧模板*/
		$task_detail.html(null);
		$task_detail.html(tpl);
		$('.datetime').datetimepicker();
		/*选中其中的form元素，因为之后会使用其监听submit事件*/
		$update_form = $task_detail.find('form');
		$task_detail_content = $update_form.find('.content');
		$task_detail_content_input = $update_form.find('[name=content]');

		$task_detail_content.on('dblclick',function() {
			$task_detail_content_input.show();
			$task_detail_content.hide();
		})

		$update_form.on('submit',function(e) {
			e.preventDefault();
			var data = {};
			data.content = $(this).find('[name=content]').val();
			data.desc = $(this).find('[name=desc]').val();
			data.remind_date = $(this).find('[name=remind_date]').val();
			update_task(index,data);
			hide_task_detail();
		})

	}

	/*查找并监听所有删除按钮的点击事件*/
	function listen_task_delete() {
		$task_delete_trigger.on('click',function() {
			var $this = $(this);
			/*找到删除按钮所在的删除元素*/
			var $item = $this.parent().parent();
			var index = $item.data('index');
			/*确认删除*/
			pop('确定要删除吗？')
				.then(function (r) {
					//r代表resolve传过来的参数
					r ? delete_task(index) : null;
				});
			
		})
	}

	function add_task(new_task) {
		task_list.push(new_task);
		/*更新localstorage*/
		refresh_task_list();
		return true;
		console.log(task_list);
	}

	/*
	 *刷新localStrorage数据并渲染模板tpl
	 **/
	function refresh_task_list() {
		store.set('task_list',task_list);
		render_task_list();
	}

	/*删除一条Task*/
	function delete_task(index) {
		/*如果没有index或者index不存在则return*/
		if(index === undefined || !task_list[index]) return;

		delete task_list[index];
		/*更新localstorage*/
		refresh_task_list();
	}

	function init() {
		//task_list是全局对象
		task_list = store.get('task_list') || [];
		if (task_list.length) render_task_list();
		task_remind_check();
		listen_msg_event();
	}

	function task_remind_check() {
		var current_timestamp,
				task_timestamp;
		var itl = setInterval(function() {
			for(var i = 0; i < task_list.length; i++ ) {
				var item = get(i);
				if (!item || !item.remind_date || item.informed) 
					continue;

				current_timestamp = (new Date()).getTime();
				task_timestamp = (new Date(item.remind_date)).getTime();
				if (current_timestamp - task_timestamp >= 1) {
					/*提醒过一次就不会再提醒*/
					update_task(i, {informed: true});
					show_msg(item.content);
				}		
			}			
		},300);
	}

	function show_msg(msg) {
		if (!msg) return;
		$msg_content.html(msg);
		$alerter.get(0).play();
		$msg.show();
	}

	function hide_msg() {
		$msg.hide();
	}

	/*
	 *渲染所有Task模板
	 **/
	function render_task_list() {
		var $task_list = $('.task-list');
		$task_list.html('');
		var complete_items = [];
		for(var i = 0; i < task_list.length; i++) {
			var item = task_list[i];
			if (item && item.complete)
				complete_items[i] = item;
			//这里不用compleye_items.push(item);要维护task_list里的i
			else
				var $task = render_task_item(item,i);
			$task_list.prepend($task);
		}

		for(var j = 0;j < complete_items.length;j++) {
			$task = render_task_item(complete_items[j],j);
			if (!$task) continue;
			$task.addClass('completed');
			$task_list.append($task);
		}

		$task_delete_trigger = $('.action.delete');
		listen_task_delete();

		$task_detail_trigger = $('.action.detail');
		$task_item = $('.task-item');
		listen_task_detail();

		$checkbox_complete = $('.task-list .complete');
		listen_checkbox_complete();
	}

	/*
	*渲染单条Task模板
	**/
	function render_task_item(data,index) {
		if (!data || !index) return;
		var list_item_tpl =			
			'<div class="task-item" data-index="'+index+'">'+
			'<span><input class="complete" '+(data.complete ? 'checked' : '')+' type="checkbox"></span>'+
			'<span class="task-content">'+data.content+'</span>'+
			'<span class="fr">'+
			'<span class="action delete">'+' 删除'+'</span>'+
			'<span class="action detail">'+' 详细'+'</span>'+
			'</span>'+
			'</div>';	
		return 	$(list_item_tpl);
	}

})()