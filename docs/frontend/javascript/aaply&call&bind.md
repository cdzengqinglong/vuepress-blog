# 手写apply,call,bind
## 写在前面

不得不说，前端门槛越来越高了，面试的难度也越来越大，除了要求熟练`Vue` 、`React` 等框架之外，手写代码也逐渐成为了前端面试常见的考题之一,而其中 `apply` 、`call` 、` bind` 的出现频率更是极大。今天我就陪大家动手实现一下这三个函数，捋一捋这三个好基友实现的细节。

## 一、apply、call 的用法

熟悉`javascript`的同学都知道，`this`是这门语言中最难以理解的知识点之一，因为涉及到的知识点太杂,本文就不展开了,具体的关于`this`的详解,推荐大家看一看 `《你不知道的Javascript (上卷)》` 一书,看完之后你会豁然开朗。对于本文,只需要知道,对于的形如 `xxx()`这种调用,我们称之为函数调用,此时this指向全局变量`window`,而对于 `obj.xxx()` 这种调用，我们称之为方法调用,此时` xxx` 内部的`this` 会指向 `obj` ,用一段代码来演示:

```javascript
// 打印 this.a 的值
function printA () {
  console.log(this.a);
}

// 全局变量
var a = 123;

var obj = {
  a: 456, // a 此时是 obj 的属性
  printA:printA,
};

// 方法调用,this指向window, 输出 123
printA();  
// 函数调用,this指向obj, 输出 456
obj.printA(); 

```

正如前面所说，普通的函数调用` this` 指向`window`，方法调用`this`指向`obj`， 但实际上两种调用本质是一样的,因为全局变量会自动成为`window`的属性/方法,所以 `printA()` 等同于 `window.printA()`，故而this指向window也就理所当然了。   

然而, 我们看到对于对象 `obj` ,我们要调用`printA`方法的话,就必须让其成为`obj`身上的一个属性。 假如现在有另外一个对象`otherObj`身上也有a属性,如果想调用`printA`方法的话,难道也要将它变为`otherObj`身上的方法吗?  显然不太科学,` javascript` 提供了方便的选择,也就是我们的`apply` 和 `bind` , 下面是两个函数的签名:

```javascript
func.apply(thisArg, [argsArray])
func.call(thisArg, arg1, arg2, ...)
```

二者的作用都是用来将函数的`this`绑定到`thisArg`指定的对象上,如果为`null`或者`undefined`,则绑定到全局对象上(浏览器中为window)，不同的地方在于, apply 的第二个参数是个数组,代表了想传递给调用函数的参数,调用的时候会依次赋值给对应的参数。 而bind的后续参数与调用函数的形参一一对应,调用的时候直接赋值给对应的形参。 看看代码:

```javascript
var objA = {
  a:1
}

var objB = {
  a:4
}

function printA(x,y) {
  console.log(this.a,x,y);
}

// 等同于 objA.printA(2,3);
// 打印 1,2,3
printA.apply(objA,[2,3]); 

// 等同于 objB.printA(5,6);
// 打印 4,5,6
printA.call(objB,5,6); 
```

可以看到，我们通过 `apply` 和 `call` 成功地将`printA`函数中的`this`绑定到了`objA`和`objB`身上,并且传入的参数也相应地生效了。



下面我们就依次来看看二者的实现。

## 二、apply 的实现

apply绑定this原理很简单,关键在于转为,将函调用转为形如`obj.xxx()`的方法调用即可,直接看看代码:

```javascript
Function.prototype.$apply = function (thisArg,args) {
  // thisArg为null或undefined,则绑定到window上
  if (thisArg === undefined || thisArg === null) {
    thisArg = window;
  }
  // 创建一个唯一的key,确保不会覆盖thisArg
  // 身上原来的属性和方法
  const key = Symbol();
  // 添加到thisArg身上,成为一个方法
  thisArg[key] = this;
  // 调用该方法,此时this指向thisArg
  // 同时将参数传入,得到返回值
  const ret = thisArg[key](..args);
  // 删除这个方法,避免内存泄漏
  delete thisArg[key];
  return ret;
}
```

代码的实现还是比较简单的,核心思想就是将 **转为`thisObj`的方法调用** ,需要注意的点有：

1. 用  `Symbol` 值来确保不会污染 `thisArg`;
2. 转为`thisArg`的方法调用 ；
3. 获得返回值后，要用`delete`删除添加上去的方法;    

接下来测试一下我们的代码:

```javascript
var a = 1;
var objA = {
  a:4
}
var objB = {
  a:7
}
function printA (x,y) {
  console.log(this.a,x,y);
}
// this 指向 window 打印 1,2,3
printA.$apply(null,[2,3]);
// this 指向 objA 打印 4,5,6
printA.$apply(objA,[5,6]);
// this 指向 objB 打印 7,8,9
printA.$apply(objB,[8,9]);
```

没有问题，出色完成任务!

## 三、call 的实现

call 和 apply 只是参数上的不同,我们直接调用即可

```javascript
Function.prototype.$call = function (thisArg,...args) {
  // 用 ... 语法将后续参数转为数组
  return this.$apply(thisArg,args);
}
```

只需要把后续参数转为数组调用$apply就好,测试一下代码:

```javascript
var a = 1;
var objA = {
  a:4
}
var objB = {
  a:7
}
function printA (x,y) {
  console.log(this.a,x,y);
}

// this 指向 window 打印 1,2,3
printA.$call(null,2,3);
// this 指向 objA 打印 4,5,6
printA.$call(objA,5,6);
// this 指向 objB 打印 7,8,9
printA.$call(objB,8,9);
```

也没有问题。

## 四、bind 的用法

`bind` 也是用来绑定`this`的，与`apply` 和`call`不同的是, `apply `和 `call`  直接返回结果,而 `bind`返回的是一个函数,这个函数中的`this`指向指定的`thisArg`, 此外bind函数还会将传给自己的第二个及后续参数传给被绑定的函数，起到一个占位的效果,看看使用方法:

```javascript
var a = 1;
var objA = {
  a:4
}
var objB = {
  a:7
}
function printA (x,y) {
  console.log(this.a,x,y);
}

// this指向window,打印:1,2,3
const printABound1 = printA.bind(window);
// 同window.printA(2,3), 打印:1,2,3;
printABound1(2,3);

// this指向window
// printA的第一个参数绑定为2
const printABound2 = printA.bind(window,2);
// 同window.printA(2,2,3), 打印:1,2,2;
printABound2(2,3);

// this指向window,
// printA 第一个参数绑定为2
// printA 第二个参数绑定为3
const printABound3 = printA.bind(window,2,3);
// 同window.printA(2,3,4,5), 打印:1,2,3;
printABound3(4,5);

// this指向objA
const printABound4 = printA.bind(objA);
// 同objA.printA(5,6), 打印:4,5,6;
printABound4(5,6);

// this指向objB
const printABound5 = printA.bind(objB,8,9);
// 同objB.printA(8,9,10,11), 打印:7,8,9;
printABound5(10,11);
```






