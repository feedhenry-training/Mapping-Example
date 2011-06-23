Ext.setup({
  onReady: function () {
    // Add a listener for window resize to reset the orientation
    Ext.EventManager.onWindowResize(function () {
      if ('undefined' !== typeof mainPanel) {
        mainPanel.setOrientation(Ext.getOrientation(), window.innerWidth, window.innerHeight);
      }
    });
    
    // initialise the main application
    init();
  }
});

function init() {
  menuDef = parser.parseMenuDef(menu);
  
  // initialise the main View
  mainPanel = new mainPanelDef();
}

// Define what a Menu item is
menuItem = Ext.regModel('MenuItem', {
  fields: [{
    name: 'menuName'
  }, {
    name: 'card'
  }]
});

// Define the main Panel of the App
mainPanelDef = Ext.extend(Ext.Panel, {
  fullscreen: true,
  layout: 'card',
  backText: 'Back',
  items: [{
    html: 'loading...'
  }],
  prevCard: [],

  // Initialisation function that sets up the Panel configuration
  initComponent: function () {
    this.backButton = new Ext.Button({
      text: this.backText,
      ui: 'back',
      handler: this.onUiBack,
      hidden: true,
      scope: this
    });
    var btns = [];
    btns.unshift(this.backButton);

    this.navigationBar = new Ext.Toolbar({
      dock: 'top',
      title: 'Mapping Example',
      items: btns.concat(this.buttons || [])
    });

    this.dockedItems = this.dockedItems || [];
    this.dockedItems.unshift(this.navigationBar);

    this.menuItemList = new Ext.List({
      itemTpl: '{menuName}',
      store: menuDef,
      allowDeselect: false,
      listeners: {
        itemtap: this.menuItemCallback,
        scope: this
      }
    });
    this.items = this.items || [];
    this.items.unshift(this.menuItemList);
    mainPanelDef.superclass.initComponent.call(this);
  },

  // When a Menu Item it pressed, swap in the Card of the relevant Menu Item 
  // and enable the back button
  menuItemCallback: function (subList, subIdx, el, e) {
    var store = subList.getStore(),
        record = store.getAt(subIdx),
        title = 'test',
        card;
    if (record) {
      card = record.get('card');
    }
    if (card) {
      this.prevCard.push(this.getActiveItem());
      this.setActiveItem(card, {
        type: 'slide'
      });
      this.currentCard = card;
    }
    this.enableUiBackButton();
  },

  enableUiBackButton: function () {
    this.backButton.show();
  },
    
  disableUiBackButton: function () {
    this.backButton.hide();
  },
  
  // Show or Hide the 'Back' button
  toggleUiBackButton: function () {
    if (this.backButton.isVisible()) {
      this.backButton.hide();
    }
    else {
      this.backButton.show();
    }
  },

  // When 'Back' is pressed, slide back the previous card, if necessary
  onUiBack: function () {
    var prev = this.prevCard.pop();
    this.setActiveItem(prev, {
      type: 'slide',
      reverse: true
    });
    if (prev === this.menuItemList) {
      this.disableUiBackButton();
    }
    else {
      this.enableUiBackButton();
    }
  }
});

/*
 * Provides a function for parsing a menu definition into a Sencha Component definition
 */
parser = function () {
  var self = {
      
    //Convert an object name into an actual object reference
    getLocalObj: function (obj_str) {
      var str_arr = obj_str.split('.');
    
      var temp_ref = window;
      var si, sl;
      for (si = 0, sl = str_arr.length; si < sl; si++) {
        temp_ref = temp_ref[str_arr[si]];
        if (typeof temp_ref === 'undefined') {
          aalert('Local object \'' + str_arr[si] + '\' not defined. (' + obj_str + ')');
          return null;
        }
      }
      
      return temp_ref;
    },
    
    /*
     * Parse the given menu definition, returning the Sencha Component definition for creating the App
     */
    parseMenuDef: function (menu) {
      var store_data = {
        model: 'MenuItem',
        data: []
      };
    
      var data = store_data.data;
      var si, sl;
      for (si = 0, sl = menu.length; si < sl; si++) {
        var menu_item = menu[si],
            menu_title = menu_item.title,
            temp_items = menu_item.items,
            temp_card_items = [];
    
        var ci, cl;
        for (ci = 0, cl = temp_items.length; ci < cl; ci++) {
          var temp_item = temp_items[ci];
          var type = temp_item.ui_type;
          
          var obj, 
              opts = {
                margin: 5
              };
          if ('undefined' !== typeof temp_item.title) {
            opts.title = temp_item.title;
          }
          
          if ('panel' === type) {
            if ('undefined' !== typeof temp_item.id) {
              opts.id = temp_item.id;
            }
            opts.flex = 1;
            obj = new Ext.Panel(opts);
          }
          else if ('button' === type) {
            if ('undefined' !== typeof temp_item.handler) {
              opts.handler = self.getLocalObj(temp_item.handler);
            }
            opts.text = temp_item.text;
            opts.ui = 'action';
            obj = new Ext.Button(opts);
          }
          temp_card_items.push(obj);
        }
    
        var card_opts = {
          layout: {
            align: 'stretch',
            pack: 'start',
            type: 'vbox'
          },
          scroll: false,
          ui: 'light',
          flex: 1,
          items: temp_card_items
        };
        var temp_card = new Ext.Container(card_opts);
        var temp_data = {
          menuName: menu_title,
          card: temp_card
        };
    
        data.push(temp_data);
      }
      
      // initialise menu store with menu definition
      var menu_def = new Ext.data.JsonStore(store_data);
      
      return menu_def;
    }
  };
  
  return {
    parseMenuDef: self.parseMenuDef
  };
}();