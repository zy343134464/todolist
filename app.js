import Vue from 'vue'

var app = new Vue({
	el: '#app',
	data: {
		newTodo: '',
		todoList: []
	},
	created: function(){
	    window.onbeforeunload = ()=>{
	      var dataString = JSON.stringify(this.todoList) 
	      window.localStorage.setItem('myTodos', dataString)  // 在用户关闭页面前，将数据保存在 localStorage 里
	    }
	    var oldDataString = window.localStorage.getItem('myTodos')
	    var oldData = JSON.parse(oldDataString)
	    this.todoList = oldData || [] // 在用户进入页面后，立刻读取 localStorage
  	},
	methods: {
		addTodo: function () {
			this.todoList.push({
				title: this.newTodo,
				createdAt: new Date(),
				done: false // 添加一个done属性
			})
			this.newTodo = '' // 清空
		},
		removeTodo: function(todo){
      		var index = this.todoList.indexOf(todo)
      		this.todoList.splice(index,1)
    	}
	}
})   
