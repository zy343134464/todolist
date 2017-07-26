import Vue from 'vue'
import AV from 'leancloud-storage'

// 初始化leancloud
var APP_ID = 'nsBo7ngv9qTYOJym4UOSp0cG-gzGzoHsz';
var APP_KEY = 'Fs6LJQCC2oHL8jtEpkj2yoKe';
AV.init({
  	appId: APP_ID,
  	appKey: APP_KEY
});


/*  验证leancloud后台数据
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
   	words: 'Hello World!'
}).then(function(object) {
   	alert('LeanCloud Rocks!');
})
*/

var app = new Vue({
	el: '#app',
	data: {
		actionType: 'signUp',
		formData: {
	      	username: '',
	      	password: ''
	    },
		newTodo: '',
		todoList: [],
		currentUser: null
	},
	created: function(){
	    window.onbeforeunload = ()=>{
	      	var dataString = JSON.stringify(this.todoList) 
/*			window.localStorage.setItem('myTodos', dataString)  //在用户关闭页面前，将数据保存在 localStorage 里*/

/*			// 将数据保存到leanclound
			// onbeforeunload 事件里面的所有请求都发不出去，会被取消		
			var AVTodos = AV.Object.extend('AllTodos');
     		var avTodos = new AVTodos();
      		avTodos.set('content', dataString);
     		avTodos.save().then(function (todo) {
       		// 成功保存之后，执行其他逻辑.
         		console.log('保存成功');
     		}, function (error) {
       		// 异常处理
        		console.error('保存失败');
      		});
      		debugger  // AllTodos 保存请求失败了，被 canceled*/
	    }

/*	    let oldDataString = window.localStorage.getItem('myTodos')
	    let oldData = JSON.parse(oldDataString)
	    this.todoList = oldData || [] // 在用户进入页面后，立刻读取 localStorage*/

  		this.currentUser = this.getCurrentUser(); // //检查用户是否登陆
/*  		// 重新读取 todo,批量操作API
   		if(this.currentUser){
     		var query = new AV.Query('AllTodos');
     		query.find()
   			// .then(function (todos) {
      			// console.log(todos)
      		.then((todos) => {
	        	let avAllTodos = todos[0] // 理论上 AllTodos 只有一个，取结果的第一项
	        	let id = avAllTodos.id
	       		this.todoList = JSON.parse(avAllTodos.attributes.content) 
	        	this.todoList.id = id //数组也是对象，可以设置属性id
    		}, function(error){
      			console.error(error) 
    		})
    	}*/
    	this.fetchTodos() // 将重新读取todo代码封装函数 fetchTodos

  	},
	methods: {
		fetchTodos:function(){
  		// 重新读取 todo,批量操作API
	   		if(this.currentUser){
	     		var query = new AV.Query('AllTodos');
	     		query.find()
	   			// .then(function (todos) {
	      			// console.log(todos)
	      		.then((todos) => {
		        	let avAllTodos = todos[0] // 理论上 AllTodos 只有一个，取结果的第一项
		        	let id = avAllTodos.id
		       		this.todoList = JSON.parse(avAllTodos.attributes.content) 
		        	this.todoList.id = id //数组也是对象，可以设置属性id
	    		}, function(error){
	      			console.error(error) 
	    		})
	    	}
		},
		updateTodos:function(){
            let dataString = JSON.stringify(this.todoList)
            let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
            avTodos.set('content', dataString)
            avTodos.save().then(()=>{
                console.log("更新成功");
            })
        },
		saveTodos: function(){
       		let dataString = JSON.stringify(this.todoList)
       		var AVTodos = AV.Object.extend('AllTodos');
       		var avTodos = new AVTodos();
       		// ACL模型,设置todo 存在用户名下,只有 todo 所属的用户能读写这些 todo
       		var acl = new AV.ACL()
 		    acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
 		    acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写
       		avTodos.set('content', dataString);
       		avTodos.setACL(acl) // 设置访问控制
       		// avTodos.save().then(function (todo) {
       		avTodos.save().then((todo) =>{
				this.todoList.id = todo.id  // 把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos
         		console.log('保存成功');
       		}, function (error) {
         		alert('保存失败');
       		});
     	},
        saveOrUpdateTodos: function(){
            if(this.todoList.id){
                this.updateTodos()
            }else {
                this.saveTodos()
            }
        },
		addTodo: function () {
			if(!this.newTodo){ alert('请输入代办事项名称！'); return false;}
      		var time = this.getNowFormatDate(Date.parse(new Date()));
			this.todoList.push({
				title: this.newTodo,
				createdAt: time,
				done: false // 添加一个done属性
			})
			this.newTodo = '' // 清空
			// this.saveTodos() // 每次用户新增时候，就发送一个请求
			this.saveOrUpdateTodos() // 不能用 saveTodos 了
		},
		removeTodo: function(todo){
      		var index = this.todoList.indexOf(todo)
      		this.todoList.splice(index,1)
     	// this.saveTodos() // 每次用户删除 todo 的时候，就发送一个请求
			this.saveOrUpdateTodos() // 不能用 saveTodos 了
    	},
    	signUp: function () {
	      	var user = new AV.User();
	      	user.setUsername(this.formData.username);
	      	user.setPassword(this.formData.password);
	      	user.signUp().then((loginedUser) => {
	        	this.currentUser = this.getCurrentUser()
	      	},  (error) => {
	      		alert('注册失败,用户名已经注册过')
	      		console.log(error);
	      	});
	    },
	    login: function () {
	        AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
	          	this.currentUser = this.getCurrentUser()
	          	this.fetchTodos() // 登录成功后读取 todos
	      	}, function (error) {
	      		alert('登录失败,用户名或密码错误')
	      		console.log(error);
	      	});
	    },
		getCurrentUser: function(){
            let current = AV.User.current() //获取用户当前的状态
            if(current){
                let {id, createdAt, attributes: {username}} = current
                return {id, username, createdAt}
            }else{
                return null
            }
        },
        logout: function(){
            AV.User.logOut()
            this.currentUser = null
            window.location.reload()
        },
        getNowFormatDate: function(tsp){
      		let time = new Date(tsp),
	        year = time.getFullYear(),
	        month = time.getMonth()+1,
	        date = time.getDate(),
	        hour = time.getHours(),
	        minute = time.getMinutes(),
	        second = time.getSeconds();
      		month = month > 10 ? month : '0'+month;
     		minute = minute > 9 ? minute : '0'+ minute;
      		second = second > 9 ? second : '0'+ second; 
      		return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    	}
	}
})   
