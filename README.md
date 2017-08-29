# bjem.js
Bem & jQuery.

The idea is:
```js
// finding all the blocks `button`
$('.button:bem');
// all the elems `text` of blocks `button`
$('.button__text:bem');

// селектор выбирает элементы с бэм-сущностью (которые созданы через bjem и имеют экземляр производящего класса)

//...
// кажется, нужно делать на основе backbone
//...нет, не нужно
$('body').append({
	block: 'button',
	text: 'abc',
	mods: {
		theme: 'islands'
	}
});

$.block('button', {
	init: function(){
		// this.bind кэширует все бинды
		// чтобы можно было их отменять
		// this.bind(func, [context = this]);
		// хотя это делает $.proxy, в принципе
		setInterval(this.bind(this.forceUpdate), 1000);

		// ну и все функции jQ, конечно
		// attr, например
	},

	tag: 'button', // or a func
	defaultMods: {
		theme: 'islands'
	},

	on: {
		click(){},
		mods: {
			theme: {
				islands: e => e
			}
		}
	},

	content: function(){ // or a value
		// this.state is a data provider
		// with this.state.on('*', this.forceUpdate);
		// но это назначается после первого рендера, чтобы в ините можно было задавать начальное состояние и подписываться до апдейта
	}
	// or this.content(...) in init
});

$('.button:bem').mod('theme');
$('.button:bem').mod('theme', 'islands');
$('.button:bem').mod('theme', false);
$('.button:bem').mod({
	theme: 'islands',
	hover: true
});


$('.button:bem').on('mod', e => {
	e.modName;
	e.newVal;
	e.oldVal;
});

$('.button:bem').on('mod:theme');
$('.button:bem').on('mod:theme(islands)');
$('.button:bem').on('mod:theme(^islands)'); // при удалении мода

// создаём новый мод
$.block('button').declMod('theme', {
	init: function(){},

	on: {
		click(){}
	}
});

// data providers
var uidp = $.dataProvider(function(){
	this.set('abc', 'lol');
	this.on('abc', function(){}, context);
});
// должен поддерживать глубокий проход по объектам
// set('obj.abc')

uidp.serialize();
var smth = $.dataProvider.unserialize(object or string);
uidp.saveDataToLocalStorage('name of data array in storage');
uidp.loadDataFromLocalStorage('name of data array in storage');
uidp.loadFrom('./smth.json');

// data providers factory
var dpf = $.dataProvider.factory(function(incomingData){});
dpf.on('update', function(newDataProvider){});

dpf.create({
	// incoming data
});

// таймер
$.block('timer', {
	init: function(){
		setInterval(function(){
			this.state.set('value', this.state.get('value') + 1);
		}.bind(this), 1000);
	},

	state: {
		value: 1
	},

	content: function(){
		return this.state.value;
		// можно вернуть и html
		// или массив элементов
		// по идеееееее
		// но нужно же искать разницу! virtualdom всё ж!
	}
});

block: 'list',
content: {
	list: [1, 2, 3, 4],
	elem: {
		tag: 'li',
		elem: 'item'
	}
} // -> <li className="list__item">1</li>
```
