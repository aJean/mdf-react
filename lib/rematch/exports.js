"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Provider", {
  enumerable: true,
  get: function get() {
    return _reactRedux.Provider;
  }
});
Object.defineProperty(exports, "connect", {
  enumerable: true,
  get: function get() {
    return _reactRedux.connect;
  }
});
Object.defineProperty(exports, "useSelector", {
  enumerable: true,
  get: function get() {
    return _reactRedux.useSelector;
  }
});
Object.defineProperty(exports, "useDispatch", {
  enumerable: true,
  get: function get() {
    return _reactRedux.useDispatch;
  }
});
exports.createModel = void 0;

var _core = require("@rematch/core");

var _reactRedux = require("react-redux");

const createModel = (0, _core.createModel)();
exports.createModel = createModel;