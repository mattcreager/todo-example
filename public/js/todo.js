/*jshint browser:true */

(function($, hbs) {
'use strict';

  /**
   * @constructor
   */
  function TodoApp(url) {
    this.url = url;

    this.template = hbs.compile($('#todo-template').html());
    this.el = {
      list: $('#todo-list'),
      input: $('#new-todo')
    };

    _.bindAll(this, [
      'createTodo',
      'deleteTodo',
      'completeTodo',
      'addHandler',
      'removeHandler',
      'completeHandler'
    ]);
  }

  /**
   * Connect to GoInstant and get any existing todos
   * @public
   */
  TodoApp.prototype.initialize = function() {
    var self = this;

    goinstant.connect(this.url, function (err, connection, lobby) {
      if (err) throw err;

      self.namespace = lobby.key('todos-are-cool');

      self.namespace.get(function(err, todos, context) {
        if (err) throw err;

        _.each(todos, function(todo, guid) {
          self.addHandler(todo, guid);
        });
      });

      self.bindEvents();
    });
  };

  /**
   * Register listeners for the UI and GoInstant
   * @private
   */
  TodoApp.prototype.bindEvents = function() {
    // Register UI listeners
    $('form').on('submit', this.createTodo);
    this.el.list.on('click', '.glyphicon-remove', this.deleteTodo);
    this.el.list.on('click', 'input', this.completeTodo);

    // Register GoInstant listeners
    this.namespace.on('add', {
      listener: this.addHandler,
      local: true
    });

    this.namespace.on('remove', {
      listener: this.removeHandler,
      local: true,
      bubble: true
    });

    this.namespace.on('set', {
      listener: this.completeHandler,
      local: true,
      bubble: true
    });
  };

  /**
   * Create the todo in GoInstant
   * @private
   * @param {object} e The jQuery event data
   */
  TodoApp.prototype.createTodo = function(e) {
    e.preventDefault();

    var todo = {
      description: this.el.input.val(),
      complete: false
    };

    this.namespace.add(todo);
  };

  /**
   * Remove the todo in GoInstant
   * @private
   * @param {object} e The jQuery event data
   */
  TodoApp.prototype.deleteTodo = function(e) {
    var $todo = $(e.target).parents('li.list-group-item');
    var todoGuid = $todo.data('guid');

    this.namespace.key(todoGuid).remove();
  };

  /**
   * Set the todo to complete in GoInstant
   * @private
   * @param {object} e The jQuery event data
   */
  TodoApp.prototype.completeTodo = function(e) {
    var $todo = $(e.target).parents('li.list-group-item');
    var todoGuid = $todo.data('guid');

    var complete = $todo.find('input[type="checkbox"]').prop('checked');

    var completeKey = this.namespace.key(todoGuid).key('complete');
    completeKey.set(complete, function(err) {
      if (err) throw err;
    });

    return false;
  };

  /**
   * Add the todo to the view
   * @private
   * @param {object} todo The todo data
   * @param {object} context A GoInstant context object
   */
  TodoApp.prototype.addHandler = function (todo, context) {
    var todoGuid = context;

    if (_.isObject(todoGuid)) {
      todoGuid = todoGuid.addedKey.split('/')[2];
    }

    todo.guid = todoGuid;
    var todoHtml = this.template(todo);

    this.el.list.prepend(todoHtml);
    this.el.input.val('');
  };

  /**
   * Remove the todo from the view
   * @private
   * @param {object} todo The todo data
   * @param {object} context A GoInstant context object
   */
  TodoApp.prototype.removeHandler = function(todo, context) {
    var todoGuid = context.key.split('/')[2];

    var $todo = this.el.list.find('li[data-guid="' + todoGuid + '"]');
    $todo.remove();
  };

  /**
  * Check off the todo in the view
  * @private
  * @param {boolean} complete The todo's complete state
  * @param {object} context A GoInstant context object
  */
  TodoApp.prototype.completeHandler = function(complete, context) {
    var todoGuid = context.key.split('/')[2];

    var $todo = this.el.list.find('li[data-guid="' + todoGuid + '"]');
    $todo.find('input[type="checkbox"]').prop('checked', complete);
  };


  window.TodoApp = TodoApp;

})(jQuery, Handlebars);
