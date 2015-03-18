App = Backbone.Model.extend({
  updateFetchedPage: function(data) {
    console.debug('updateFetchedPage', data)
    var dom = $.parseHTML(data);
    console.debug(dom)
    this.attributes['dom'] = dom;
    this.trigger('dom_updated')
    this.on('tag_clicked', function(e) {
      this.trigger('highlight_markup', e)
    }.bind(this));
  },

  render: function() {
    return this;
  }
});

TagView = Backbone.View.extend({
  
  initialize: function (model) {
    this.$el = $('#tags');
    console.log('tag view created with model' + model)
    console.debug(model)
    this.model = model;
    this.model.on('dom_updated', this.populate.bind(this));
    // is this needed?
  },

  populate: function(){
    var data = this.model.get('dom')
    console.debug('populate list', data)
    var tagMap = {}
    data.forEach(function (tag) {
      var tagName = tag.tagName;
      if (typeof tagMap[tagName] == 'undefined') {
        tagMap[tagName] = 0
      }
      tagMap[tagName] += 1
    });
    var content = $('<ul></ul>');
    $.each(tagMap, function (tagName, count) {
      console.log(tagName, count)
      tagName = tagName.toLowerCase();
      var bullet = $("<li>");
      bullet.append('<a class="tag-list" href="#">' + tagName + ' (' + count + ')</a>');
      bullet.on('click', function(e) {
        console.log('tigger!!' + e);
        this.model.trigger('tag_clicked', tagName)
      }.bind(this));
      bullet.appendTo(content);
    }.bind(this));


    this.$el.empty().html(content)
  },
  render: function() {
    this.model.on('dom_updated', this.populate.bind(this));
    return this;
  }
})

MarkupView = Backbone.View.extend({
  initialize: function (model) {
    this.$el = $('#markup');
    console.log('markup view created')
    this.model = model;
    this.model.on('dom_updated', this.populate.bind(this));
    this.model.on('highlight_markup', this.selectTag.bind(this));
  },

  selectTag: function(tagName) {
    console.debug('selectTag! ', tagName);
    this.populate(tagName);
  },

  awesome_escape: function(html) {
    if (html) {
      return html.replace(/&/g, '&amp;').replace(/</g, "&lt;" ).replace(/>/g, '&gt;')
    }
  },

  populate: function(highlightTag) {
    var data = this.model.get('dom')
    if (!data) {
      return;
    }
    var content = $('<div class="content"></div>')
    
    data.forEach(function (elt) {
      tagName = (elt.tagName || "").toLowerCase();
      var tagClass = 'tag-' + tagName;
      if (highlightTag == tagName) {
        tagClass += ' highlight';
      }
      var markup = $('<div class="' + tagClass + '"></div>');
      markup.html(this.awesome_escape(elt.outerHTML));
      markup.on('click', function() {
        alert('yo! ' + tagName);
      })
      content.append(markup);
    }.bind(this));

    // console.debug('populate markup', data)
    this.$el.empty().html(content.html())    
  },

  render: function() {
    this.model.on('dom_updated', this.populate.bind(this))
    this.model.on('tag_clicked', this.selectTag.bind(this));
    this.populate();
    return this;
  }
})

AppView = Backbone.View.extend({
  el: '#url-fetch',
  
  DATA: '<html><body><p>yo yo yo</p><p>this is the stuff<div>blah</div>blah</p></body></html>',

  initialize: function (model) {
    this.model = model;
    this.tagView = new TagView(model);
    this.markupView = new MarkupView(model);
    console.debug('initializing the app view.', model);
    // todo: local storage once the other stuff works.
    // todoList.fetch(); // Loads list from local storage
  },

  events: {
    // 'blur #url': 'urlChanged',
    'submit #this-is-ze-form': 'urlChanged',
  },
  
  onUrlFetchSuccess: function(args) {
    console.log('onUrlFetchSuccess')

    this.model.updateFetchedPage(this.DATA);
    console.debug(args)
  },
  onUrlFetchError: function(args) {
    console.log('onUrlFetchError')
    this.model.updateFetchedPage(this.DATA);
    console.debug(args)
  },

  urlChanged: function (x) {
    var url =  $('#url')[0].value
    url = '/app/assets/javascripts/slack/index.html';
    console.log('url changed: ' + url)
    $.get(url).
      success(this.onUrlFetchSuccess.bind(this)).
      error(this.onUrlFetchError.bind(this));
    return false;
  }
});

//--------------
// Initializers
//--------------   

appView = new AppView(new App());


