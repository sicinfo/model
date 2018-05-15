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
      // const $ = {};
      Object.defineProperty(this, '$', { 'value': $, 'writable': false });
    }

    url(options = {}) {
      const { $ } = this;
      let { url, param, query } = options;

      if (undefined == url) url = $.url || '';

      if (query) {
        if ('object' == typeof (query)) {
          const esc = encodeURIComponent;
          query = Object.keys(query).map(key => `${esc(key)}=${esc(query[key])}`);
        }
        if (isArray(query)) query = query.join('&');
        if (!query.startsWith('?')) query = `?${query}`;
        url = `${url}${query}`;
      }

      if (param) {
        if (isArray(param)) param = `${param.join('/')}`;
        if (!param.startsWith('/')) param = `/${param}`;
        url = `${url}${param}`;
      }

      return url;
    }

    static parse(arg) {

      if (!(
        isArray(arg) &&
        arg.length > 1 &&
        isArray(arg[0]) &&
        arg[0].every(a => 'string' == typeof (a))
      )) return arg;

      return arg.slice(1).map(vals => {
        const obj = {};
        arg[0].some((key, ind) => { obj[key] = Sync.parse(vals[ind]) });
        return obj;
      })

    }

    static sync(options) {

      const $this = this;

      return new Promise((resolve, reject) => {
        fetch($this.url(options), options.syncOptions)
          .then(resp => { resp.ok ? resolve(resp) : reject(resp) })
          .catch(err => { reject(err) })
      })

    }

    static delete() { }

    static post() { }

    static patch() { }

    static fetch(options) {

      const $this = this;

      options.syncOptions = {
        'method': 'GET',
        'headers': new Headers({
          'content-type': 'application/json'
        })
      };

      return new Promise((resolve, reject) => {
        Sync.sync.call($this, options)
          .then(response => {
            response.json().then(attributes => {
              resolve({ attributes, response, options })
            })
          })
          .catch(err => reject(err))
      })

    }

  }

  class Model extends Sync {

    constructor(attrs, options = {}) {
      super(options);
      const $this = this, { $ } = $this;

      if (options.collection) $.collection = options.collection

      $.idAttribute = options.idAttribute || 'id'
      $.defaults = options.defaults || {}
      $.cid = uniqueId(options.cidPrefix || 'm')
      $.attributes = {}

      $this.set(clone($.defaults, attrs), options)
    }

    get id() {
      return this.get(this.idAttribute)
    }

    get cid() {
      return this.$.cid;
    }

    get collection() {
      return this.$.collection;
    }

    get idAttribute() {
      return this.$.idAttribute;
    }

    has(attr) {
      return attr in this.$.attributes;
    }

    get(attr) {
      return this.$.attributes[attr]
    }

    set(attrs, val, options = {}) {

      if ('object' == typeof (attrs)) val && (options = val);
      else (key => (attrs = {})[key] = val)(attrs);

      // console.log(this);

      const $this = this, { $ } = $this;

      if (!$this.validate(attrs, options)) return false

      $.previousAttributes = clone($.attributes)

      const current = $.attributes
      const unset = options.unset

      Object.keys(attrs).some(attr => {
        if (unset) { if (attr in current) delete current[attr] }
        else if (!(attr in current && current[attr] == val)) current[attr] = attrs[attr]
      })

      if ($.idAttribute in attrs) $.id = $this.get($.idAttribute)

      return this;
    }

    unset(attr, options) {
      return this.set(attr, undefined, clone(options, { 'unset': true }))
    }

    clear(options) {
      const attrs = {};
      Object.keys(this.$.attributes).some(attr => { attrs[attr] = undefined });
      return this.set(attrs, clone(options, { 'unset': true }));
    }

    isNew() {
      return !this.has(this.$.idAttribute)
    }

    toJSON() {
      return clone(this.$.attributes)
    }

    hasChanged(attr) {
      const changed = this.changedAttributes();

      return undefined == attr ?
        !!Object.keys(changed).length :
        attr in changed
    }

    changedAttributes() {
      const { previousAttributes, attributes } = this.$;
      const changed = {};

      Object.keys(attributes)
        .filter(attr => !(attr in previousAttributes && previousAttributes[attr] == attributes[attr]))
        .some(attr => { changed[attr] = attributes[attr] });

      return changed;
    }

    parse(resp, options) {

      if (resp && 'object' == typeof (resp)) {
        Object.keys(resp).some(attr => resp[attr] = Sync.parse(resp[attr]));
      }

      return resp
    }

    url(options = {}) {
      const $this = this, { $ } = $this;
      const { param } = options;

      if (!param && !$this.isNew()) {
        options.param = `${$this.id}`;
      }

      return super.url(options);
    }

    fetch(options) {
      const model = this, { $ } = model;
      const { idAttribute } = $;

      options = assign({ 'parse': true }, options);
      idAttribute in options && model.set(idAttribute, options[idAttribute]);

      return new Promise((resolve, reject) => {

        if (model.isNew()) {
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

    save(key, val, options) {

      // if (!)

    }

    validate(attrs, options) {
      return true;
    }

  }

  class Collection extends Sync {

    constructor(models, options = {}) {
      super(options);

      const $this = this, { $ } = $this;

      $.model = options.model || Model;

      $this._reset()

      if (models) $this.reset(models, options);
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

      const $this = this, { $ } = $this;

      $this.models.some(model => $this._removeReference(model, options));
      $this._reset();

      return $this.add(models, options);
    }

    add(models, options) {
      const $this = this;
      return $this.set(models, clone(options, { 'add': true, 'remove': false }));
    }

    remove(models, options) {
      options = clone(options);
      const singular = !isArray(models);
      if (singular) models = [models];

      const $this = this;
      const removed = $this._removeModels(models, options);

      return singular ? removed[0] : removed;
    }

    // collecion.set
    set(models, options) {

      if (undefined == models) return
      options = assign({ 'add': true, 'remove': true, 'merge': true }, options);

      const $this = this, { $ } = $this;

      if (options.parse && !$this._isModel(models)) {
        models = $this.parse(models, options) || [];
      }

      const { add, merge, remove } = options;
      const replace = add && remove;
      const set = [], toAdd = [], toMerge = [], modelMap = {};
      const singular = !isArray(models);

      if (singular) models = [models]

      models.some((model, i) => {

        const existing = $this.get(model);

        // console.log('existing', existing)
        // console.log('add', add)
        // console.log('remove', remove)
        // console.log('merge  ----------> ', merge)

        if (existing) {

          // console.log('model  ----------> ', model.$)
          // console.log('existing  -------> ', existing.$)
          // console.log('model !== existing ', model !== existing)

          if (merge && (model.$ && model.cid) != existing.cid) {
            const attrs = $this._isModel(model) ? model.$.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
          }

          // console.log('!modelMap[existing.$.cid]   -> ', !modelMap[existing.$.cid])

          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }

          models[i] = existing;
        }

        else if (add) {

          model = models[i] = $this._prepareModel(model, options);

          if (model) {
            toAdd.push(model);
            $this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }

        }

      })

      if (remove) {
        $this._removeModels($this.models.filter(model => undefined == modelMap[model.cid]), options);
      }

      // console.log('set.length', set.length)
      // console.log('replace', replace)


      if (set.length && replace) {
        $this.models.length = 0;
        $this.models.splice(0, 0, ...set);
      }

      else if (toAdd.length) {
        $.models.splice($.length, 0, ...toAdd);
      }

      // console.log('<--- collection.set')
      // console.log('----------------------------------------------------------------')
      return singular ? models[0] : models;
    }

    modelId(attrs) {
      return attrs &&
        this.model &&
        new this.model(attrs).id ||
        undefined
    }

    // collection.get
    get(arg) {
      const $this = this, { $ } = $this;

      if (undefined == arg) return undefined;
      if (arg in $.byId) return $.byId[arg];
      if ('object' != typeof (arg)) return undefined;
      if (!('$' in arg)) arg = { '$': arg };

      const id = $this.modelId(arg.$.attributes || arg.$);

      return id && id in $.byId ? $.byId[id] :
        arg.cid && arg.cid in $.byId ? $.byId[arg.cid] :
          undefined;
    }

    has(arg) {
      return !!this.get(arg);
    }

    toJSON(options) {
      return this.models.map(model => model.toJSON(options));
    }

    parse(resp, opts) {
      return resp ? Sync.parse(resp) : resp;
    }

    create(model, options) {
      options = clone(options);

      model = this._prepareModel(model, options);
      if (!model) return;

      this.add(model, options);

      return model.save(null, options);
    }

    fetch(options) {
      const collection, { $ } = collection = this;

      return Sync.fetch.call(collection, assign({ 'parse': true }, options))
        .then(({ attributes, response, options }) => {
          collection[options.reset ? 'reset' : 'set'](attributes, options);
          return { collection, response, options }
        });
    }

    _reset() {
      const { $ } = this;
      $.models = [];
      $.byId = {};
    }

    _isModel(model) {
      return model instanceof this.model
    }

    _prepareModel(attrs, options) {

      if (this._isModel(attrs)) {
        if (!(attrs.$.collection)) attrs.$.collection = this;
        return attrs;
      }

      return new this.model(attrs, clone(options, { 'collection': this }));
    }

    _removeModels(models, options) {
      const removed = [];

      models.map(model => this.get(model)).filter(a => a).some(model => {

          // console.log('-----------------')

          // console.log(model)
          // console.log($.models)
          // console.log($.models.length)
          // console.log($.models.indexOf(model))

          this.models.splice(this.models.indexOf(model), 1);

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

      this.$.byId[model.cid] = model;
      if (id) this.$.byId[id] = model;
    }

    _removeReference(model, options) {
      const id = this.modelId(model.attributes);

      delete this.$.byId[model.cid]
      if (id) delete this.$.byId[id]
      if (this == model.collection) delete model.$.collection
    }

  }

  return { Collection, Model, Sync }
})

