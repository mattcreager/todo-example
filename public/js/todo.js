(function($, hbs, guid) {
  var EMPTY = '';
  var URL = 'https://goinstant.net/mattcreager/DingDong';

  var todos = [{
    description: 'Make this bad boy multi-user',
    complete: false,
    guid: guid()
  }];

  function TodoApp () {
    this.template = hbs.compile($('#todo-template').html());
    this.el = {
      list: $('#todo-list'),
      input: $('#new-todo')
    };

    _.bindAll(this);
  }

  TodoApp.prototype.start = function() {
    var self = this;
    console.log('This Todo App Is Starting...');
    goinstant.connect(URL, function (err, connection, lobby) {
      if (err) throw err;

      self.namespace = lobby.key('todos-are-cool');
      self.namespace.get(function(err, todos, context) {
        if (err) throw err;
        _.each(todos, self.newTodo.bind(self));
      });

      self.bindEvents();
    });
  };

  TodoApp.prototype.bindEvents = function() {
    $('form').on('submit', this.todoAdded.bind(this));
    this.el.list.on('click', '.glyphicon-remove', this.todoRemoved);
    this.el.list.on('change', 'input', this.todoComplete);
  };

  TodoApp.prototype.todoAdded = function(e) {
    e.preventDefault();

    var todo = {
      description: this.el.input.val(),
      complete: false,
      guid: guid()
    };

    this.namespace.key(todo.guid).set(todo);

    this.newTodo(todo);
  };

  TodoApp.prototype.todoComplete = function(e) {
    var $todo = $(this).parents('.list-group-item');
    var todoGuid = $todo.data('guid');
    var complete = $(this).prop('checked');
  };

  TodoApp.prototype.todoRemoved = function(e) {
    var $todo = $(e.target).parents('.list-group-item');
    var todoGuid = $todo.data('guid');

    this.namespace.key(todoGuid).remove();
    $todo.remove();
  };

  TodoApp.prototype.newTodo = function (todo) {
    var todoHtml = this.template(todo);

    this.el.list.prepend(todoHtml);
    this.el.input.val(EMPTY);
  };

  var todoApp = new TodoApp();

  todoApp.start();

})(jQuery, Handlebars, guid);
