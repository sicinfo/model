/**
 * applicatiion: lib/fetch
 * 
 * [0.1.0] [2018-05-15T10:20]
 * 
 * [0.0.2] 2018-03-07
 * 
 * [0.0.1] 2018-02-27
 * - experimental
 * 
 * ref:
 * https://www.tutorialspoint.com/backbonejs/backbonejs_collection.htm
 * 
 */

((root, factory) => {

  const uniqueid = Symbol(); root[uniqueid] = 0;

  if ('undefined' != typeof (define))
    define([], () => factory(root, a => `${a}_${++root[uniqueid]}`));

  else if ('undefined' != typeof (process) && process.versions && process.versions.node)
    module.exports = factory(root, a => `${a}_${++root[uniqueid]}`);

})(this || self || window, (root, uniqueId) => {


  const assign = Object.assign;
  const clone = (...a) => assign({}, ...a);
  const fetch = root && root.fetch;
  const isArray = Array.isArray;

  class Sync {

    constructor(options) {
      Object.defineProperty(this, '$', { 'value': {}, 'writable': false });
    }

    url(options = {}) {

      let { url, param, query } = options;

      if (undefined === url) url = this.$.url || '';

      if (param) {
        if (isArray(param)) param = `${param.join('/')}`;
        if (!param.startsWith('/')) param = `/${param}`;
        url = `${url}${param}`;
      }

      if (query) {
        if ('object' === typeof (query)) {
          const esc = encodeURIComponent;
          query = Object.keys(query).map(key => `${esc(key)}=${esc(query[key])}`);
        }
        if (isArray(query)) query = query.join('&');
        if (!query.startsWith('?')) query = `?${query}`;
        url = `${url}${query}`;
      }

      return url;
    }

    static parse(arg) {

      if (isArray(arg) && arg.length > 1 &&
        isArray(arg[0]) && isArray(arg[1]) &&
        arg[0].length == arg[1].length &&
        arg[0].every(key => 'string' === typeof (key))) {

        const header = arg[0], { length } = header;

        return arg.slice(1).map(values => {
          const resp = {};
          for (let index = 0; index < length; index++) {
            resp[header[index]] = Sync.parse(values[index]);
          }
          return resp;
        });

      }

      return arg;

    }

    static sync(url, options) {

      if (!('headers' in options.syncOptions)) {
        options.syncOptions.headers = new Headers();
      }

      options.syncOptions.headers.set('content-type', 'application/json');

      return new Promise((resolve, reject) => {
        fetch(url, options.syncOptions)
          .then(response => {
            if (response.ok) response.json().then(attributes => resolve({ attributes, response, options }))
            else reject(response);
          })
          .catch(err => reject(err))
      })
    }

    static send(method, options) {
      options.syncOptions = { method, 'body': JSON.stringify(this.attributes) };
      return Sync.sync(this.url(options), options);
    }

    static fetch(options) {
      options.syncOptions = { 'method': 'GET' };
      return Sync.sync(this.url(options), options);
    }

  }

  class Model extends Sync {

    constructor(attrs, options = {}) {
      super(options);
      const { idAttribute, defaults, cidPrefix, collection } = options;
      if (collection) this.$.collection = collection;
      this.$.idAttribute = idAttribute || 'id';
      this.$.defaults = defaults || {};
      this.$.cid = uniqueId(cidPrefix || 'm');
      this.$.attributes = {};
      this.set(clone(this.$.defaults, attrs), options)
    }

    get id() {
      return this.$.id
    }

    get attributes() {
      return this.$.attributes
    }

    get collection() {
      return this.$.collection || undefined;
    }

    get idAttribute() {
      return this.$.idAttribute;
    }

    get isNew() {
      return !this.has(this.$.idAttribute)
    }

    has(attr) {
      return attr in this.$.attributes;
    }

    get(attr) {
      return this.$.attributes[attr]
    }

    set(attrs, val, options = {}) {

      if ('object' === typeof (attrs)) val && (options = val);
      else (key => (attrs = {})[key] = val)(attrs);

      if (!this.validate(attrs, options)) return false

      this.$.previousAttributes = this.$.attributes;

      const current = this.$.attributes
      const unset = options.unset

      Object.keys(attrs).some(attr => {
        if (unset) { if (attr in current) delete current[attr] }
        else if (!(attr in current && current[attr] === val)) current[attr] = attrs[attr]
      })

      if (this.$.idAttribute in attrs) this.$.id = this.get(this.$.idAttribute);

      return this;
    }

    unset(attr, options) {
      return this.set(attr, undefined, clone(options, { 'unset': true }));
    }

    clear(options) {
      const attrs = {};
      Object.keys(this.$.attributes).some(attr => { attrs[attr] = undefined });
      return this.set(attrs, clone(options, { 'unset': true }));
    }

    toJSON() {
      return clone(this.$.attributes);
    }

    hasChanged(attr) {
      const changed = this.changedAttributes();
      return undefined === attr ? !!Object.keys(changed).length : attr in changed
    }

    changedAttributes() {
      const { previousAttributes, attributes } = this.$;
      const changed = {};

      Object.keys(attributes)
        .filter(attr => !(attr in previousAttributes && previousAttributes[attr] === attributes[attr]))
        .some(attr => { changed[attr] = attributes[attr] });

      return changed;
    }

    parse(resp, options) {

      if (resp && 'object' === typeof (resp)) {
        Object.keys(resp).some(attr => { resp[attr] = Sync.parse(resp[attr]) });
      }

      return resp
    }

    url(options = {}) {
      const { param } = options;

      if (!param && !this.isNew) {
        options.param = `${this.id}`;
      }

      return super.url(options);
    }

    fetch(options) {
      const model = this;
      const { idAttribute } = model.$;

      options = assign({ 'parse': true }, options);
      idAttribute in options && model.set(idAttribute, options[idAttribute]);

      return new Promise((resolve, reject) => {

        if (model.isNew) {
          reject({ 'error': 'modelo sem identificador' });
        }

        else {
          Sync.fetch.call(model, options)
            .then(({ attributes, response, options }) => {
              model.set(options.parse ? model.parse(attributes, options) : attributes, options)
              resolve({ model, response, options })
            });
        }

      })
    }

    delete(attrs = null, val, options = {}) {
      if (attrs) {
        if ('object' === typeof (attrs)) val && (options = val);
        else (key => (attrs = {})[key] = val)(attrs);
      }
      return this.save(attrs, Object.assign({ 'delete': true }, options))
    }

    save(attrs, val, options = {}) {

      if ('object' === typeof (attrs)) val && (options = val);
      else (key => (attrs = {})[key] = val)(attrs);
      options = Object.assign({ 'parse': true }, options);

      return new Promise((resolve, reject) => {

        if (attrs && !this.set(attrs, options)) reject(this);

        else {
          Sync.send.call(this, this.isNew ? 'POST' : (options.delete ? 'DELETE' : 'PUT'), options)
        }

      });




    }

    validate(attrs, options) {
      return true;
    }

  }

  class Collection extends Sync {

    constructor(models, options = {}) {
      const { model } = options;
      super(options);
      this.$.model = model || Model;
      this._reset();
      if (models) this.reset(models, options);
    }

    get model() {
      return this.$.model
    }

    get models() {
      return this.$.models
    }

    get length() {
      return this.models.length
    }

    reset(models, options) {
      options = clone(options)

      this.models.some(model => { this._removeReference(model, options) });
      this._reset();

      return this.add(models, options);
    }

    add(models, options) {
      return this.set(models, clone(options, { 'add': true, 'remove': false }));
    }

    remove(models, options) {
      options = clone(options);
      const singular = !isArray(models);
      if (singular) models = [models];

      const removed = this._removeModels(models, options);

      return singular ? removed[0] : removed;
    }

    // collecion.set
    set(models, options) {

      if (undefined === models) return
      options = assign({ 'add': true, 'remove': true, 'merge': true }, options);

      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      const { add, merge, remove } = options;
      const replace = add && remove;
      const set = [], toAdd = [], toMerge = [], modelMap = {};
      const singular = !isArray(models);

      if (singular) models = [models]

      models.some((model, i) => {

        const existing = this.get(model);

        // console.log('existing', existing)
        // console.log('add', add)
        // console.log('remove', remove)
        // console.log('merge  ----------> ', merge)

        if (existing) {

          // console.log('model  ----------> ', model.$)
          // console.log('existing  -------> ', existing.$)
          // console.log('model !== existing ', model !== existing)

          if (merge && (model.$ && model.$.cid) != existing.$.cid) {
            const attrs = this._isModel(model) ? model.$.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
          }

          // console.log('!modelMap[existing.$.cid]   -> ', !modelMap[existing.$.cid])

          if (!modelMap[existing.$.cid]) {
            modelMap[existing.$.cid] = true;
            set.push(existing);
          }

          models[i] = existing;
        }

        else if (add) {

          model = models[i] = this._prepareModel(model, options);

          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.$.cid] = true;
            set.push(model);
          }

        }

      })

      if (remove) {
        this._removeModels(this.models.filter(model => undefined === modelMap[model.$.cid]), options);
      }

      // console.log('set.length', set.length)
      // console.log('replace', replace)


      if (set.length && replace) {
        this.$.models.length = 0;
        this.$.models.splice(0, 0, ...set);
      }

      else if (toAdd.length) {
        this.$.models.splice(this.$.models.length, 0, ...toAdd);
      }

      // console.log('<--- collection.set')
      // console.log('----------------------------------------------------------------')
      return singular ? models[0] : models;
    }

    modelId(attrs) {
      return attrs &&
        this.$.model &&
        new this.$.model(attrs).id ||
        undefined
    }

    // collection.get
    get(arg) {
      if (undefined === arg) return undefined;

      const $ = this.$;
      if (arg in $.byId) return $.byId[arg];
      if ('object' !== typeof (arg)) return undefined;
      if (!('$' in arg)) arg = { '$': arg };

      const id = this.modelId(arg.$.attributes || arg.$);
      return id && id in this.$.byId ?
        this.$.byId[id] :
        arg.$.cid && arg.$.cid in $.byId ? $.byId[arg.$.cid] : undefined;
    }

    has(arg) {
      return !!this.get(arg);
    }

    toJSON(options) {
      return this.$.models.map(model => model.toJSON(options));
    }


    parse(resp, opts) {
      return resp ? Sync.parse(resp) : resp;
    }

    sort(options = {}) {
      let comparator = this.comparator;

      if (!comparator) {
        throw new Error('é necessario um comparador para ordenar');
      }

      const length = comparator.length;
      if ('function' === typeof comparator) {
        comparator = comparator.bind.call(this);
      }

      if (length == 1 || 'string' === typeof comparator) {
        this.$.models = this.sortBy(comparator);
      }
      else {
        this.$.models.sort(comparator);
      }

      return this;
    }

    create(model, options) {
      options = clone(options);

      model = this._prepareModel(model, options);
      if (!model) return;

      this.add(model, options);

      return model.save(null, options);
    }

    fetch(options) {
      const collection = this;

      return Sync.fetch.call(collection, assign({ 'parse': true }, options))
        .then(({ attributes, response, options }) => {
          collection[options.reset ? 'reset' : 'set'](attributes, options);
          return { collection, response, options }
        });
    }

    _reset() {
      this.$.models = [];
      this.$.byId = {};
    }

    _isModel(model) {
      return model instanceof this.$.model
    }

    _prepareModel(attrs, options) {

      if (this._isModel(attrs)) {
        if (!(attrs.$.collection)) attrs.$.collection = this;
        return attrs;
      }

      return new this.$.model(attrs, clone(options, { 'collection': this }));
    }

    _removeModels(models, options) {
      const removed = [];

      models.map(model => this.get(model)).filter(a => a).some(model => {

        // console.log('-----------------')

        // console.log(model)
        // console.log($.models)
        // console.log($.models.length)
        // console.log($.models.indexOf(model))

        this.$.models.splice(this.$.models.indexOf(model), 1);

        // console.log($.models)
        // console.log($.models.length)

        // console.log('-----------------')

        removed.push(model);
        this._removeReference(model, options);
      })

      return removed;
    }

    _addReference(model, options) {
      if (!('$' in model)) return;

      const id = this.modelId(model.attributes);

      this.$.byId[model.$.cid] = model;
      if (id) this.$.byId[id] = model;
    }

    _removeReference(model, options) {
      const id = this.modelId(model.attributes);

      delete this.$.byId[model.$.cid];
      if (id) delete this.$.byId[id];
      if (this === model.$.collection) delete model.$.collection;
    }

  }

  return { Collection, Model, Sync }
})

