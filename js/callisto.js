
const CARRIAGE_RETURN = '\r'.charCodeAt(0);
const LISTS_LIST_ITEMS_SELECTOR = '> *:visible:not([id=list-id-default])';
const TOTAL_STORAGE_KEY = 'callistoLists';

const WELCOME_LISTS = [
  {
    id: 'default',
    title: 'Default',
    items: [
      { title: 'Welcome to Callisto!', color: '#A8DBFF' },
      { title: 'Creating new cards is easy.', color: '#85CCFF' },
      { title: 'Just click in the "New item" box...', color: '#85DAFF' },
      { title: 'Type in "Hello, World!"', color: '#85F3FF' },
      { title: 'And press Enter!', color: '#85FFE0' }
    ]
  }
];

function syncStorage()
{
  var callistoLists = [];

  $('.list:visible').each(function() {
    var list_data = $(this).data('list_data');
    list_data.items = [];

    $(this).find('.list-items li').each(function() {
      list_data.items.push($(this).data('item_data'));
    });

    callistoLists.push(list_data);
  });

  $.totalStorage(TOTAL_STORAGE_KEY, callistoLists);
}

// Creates the <li> element representing item_data
function renderItem(item_data)
{
  var li = $('#list-item-base').clone()
    .attr('id', null)
    .data('item_data', item_data)
    .css('background-color', item_data.color);

  // Set item title
  li.find('.list-item-title').text(item_data.title);
  // Register delete button
  li.find('.list-item-delete').button({
    icons: {
      primary: 'ui-icon-cancel'
    },
    text: false
  }).click(function() {
    $(this).parents('.item').remove();
    syncStorage();
  });

  return li;
}

// Renders item_data to HTML, adds it to a <ul>, and syncs storage
function addItemToUl(item_data, ul)
{
  var li = renderItem(item_data);
  li.appendTo(ul);
  syncStorage();
}

// Renders list_data and any item_data's to HTML
function renderAndAddList(list_data, item_data_list)
{
  var list_base = $('#list-base').clone();
  // Remove base list item
  list_base.find('#list-item-base').remove();

  list_base.attr('id', 'list-id-' + list_data.id);
  list_base.data('list_data', list_data);

  // Set the title
  list_base.find('.list-title').text(list_data.title);
  // Fancy-ass delete button
  list_base.find('.list-delete').button({
      icons: {
        primary: 'ui-icon-cancel'
      },
      text: false
    })
    .click(function() {
      $(this).parents('.list').remove();
      syncStorage();
    });

  // Input hints (label in textbox till the user focuses)
  list_base.find('input.new-item').inputHints();

  // Add the items
  var ul = list_base.find('ul');
  $.each(item_data_list, function(i, item_data) {
    renderItem(item_data).appendTo(ul);
  });

  ul.sortable({
    update: function(event, ui) {
      syncStorage();
    },
    connectWith: ['.list:visible .list-items']
  });

  list_base.appendTo($('#lists-list'));
  return list_base;
}

function createAndAddList(title)
{
  var list_data = {
    id: $.createGUID(),
    title: title
  };

  return renderAndAddList(list_data, []);
}

function newListFromEntry()
{
  var entry = $('#new-list-entry');
  var list_base = createAndAddList(entry.val());
  syncStorage();

  entry.val('');
  $('#new-list-entry-wrapper').dialog('close');

  list_base.find('.new-item').focus();
}

$(function() {
  $('#tabs').tabs({
    cookie: {
      expires: 365
    },
    selected: 1,
    show: function(event, ui) {
      if (ui.tab.text == 'Lists')
        $('#new-list-wrapper').show();
      else
        $('#new-list-wrapper').hide();
    }
  });

  var newListDialog = $('#new-list-entry-wrapper').dialog({
    autoOpen: false,
    draggable: false,
    resizable: false,
    buttons: [
      {
        text: 'Add',
        click: newListFromEntry
      }
    ],
    position: {
      my: 'right top',
      at: 'right bottom',
      of: $('#new-list'),
      offset: '-5 10'
    }
  });
  $('#new-list-entry').keydown(function(e) {
    if (e.keyCode == CARRIAGE_RETURN && $(this).val().trim())
    {
      newListFromEntry();
      return false;
    }
  });

  $('#new-list').button({
    icons: {
      primary: 'ui-icon-plusthick'
    }
  }).click(function() {
    var entry = $('#new-list-entry');
    if (newListDialog.dialog('isOpen'))
      newListDialog.dialog('close');
    else
    {
      newListDialog.dialog('open');
      entry.val('List').focus().select();
    }
  });

  // Handle adding new items from the input box.
  $('#lists-list').on('keydown', 'input.new-item', function(e) {
    // Catch the user pressing Enter
    if (e.keyCode == CARRIAGE_RETURN && $(this).val().trim())
    {
      // We only add the item if it's got non-whitespace chars in it
      addItemToUl({ title: $(this).val() }, $(this).parents('.list').find('.list-items'));
      $(this).val('');
      return false;
    }

    return true;
  });

  // Grab any saved lists from storage
  var listsToRender = $.totalStorage('callistoLists');
  // If there are none, use the Welcome lists (tutorial shtuff)
  if (!listsToRender)
    listsToRender = WELCOME_LISTS;

  // Loop through our lists, render them, and straight add them
  $.each(listsToRender, function(i, list_data) {
    renderAndAddList(list_data, list_data.items);
  });

  // Once our lists are added, we can make them sortable
  $('#lists-list').sortable({
    items: LISTS_LIST_ITEMS_SELECTOR,
    handle: '> section > header',
    update: syncStorage
  });
});
