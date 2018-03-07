/**
 * applicatiion: lib/fetch
 * 
 * [0.0.1] 2018-02-27
 * - experimental
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

      let $ = {}
      Object.defineProperty(this, '$', { 'value': $, 'writable': false })

      undefined == options || (
        'object' == typeof (options) && (
          undefined == options.url || ($.url = `${options.url}`)
        ) || ($.url = `${options}`)
      )
    }

    url(options) {
      return undefined == options ? this.$.url :
        'object' == typeof (options) ?
          undefined == options.url ? undefined : `${options.url}` :
          `${options}`
    }

    parse(resp, opts) {

      if (resp) {

        if (this.models)
          resp = Sync._parse(resp)

        else if (this.cid && 'object' == typeof (resp))
          Object.keys(resp).some(a => { resp[a] = Sync._parse(resp[a]) })

      }

      return resp
    }

    static _parse(arg) {

      if (!(
        isArray(arg) &&
        arg.length > 1 &&
        isArray(arg[0]) &&
        arg[0].every(a => 'string' == typeof (a))
      )) return arg;

      return arg.slice(1).map(vals => {
        let obj = {};
        arg[0].some((key, ind) => { obj[key] = vals[ind] });
        return obj;
      })

    }

    static sync(options) {

      let { url } = this;

      return new Promise((resolve, reject) => {
        fetch(url(), options)
          .then(resp => {
            resp.ok ? resolve(resp) : reject(resp)
          })
          .catch(err => {
            reject(err)
          })
      })

    }

    static delete() { }

    static post() { }

    static patch() { }

    static fetch(options) {

      const _this = this;

      let {
        where
      } = options;

      options.syncOptions = {
        'method': 'GET',
        'headers': new Headers({
          'content-type': 'application/json'
        })
      };

      return new Promise((resolve, reject) => {
        Sync.sync.call(_this, options.syncOptions)
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

      let $ = {}
      Object.defineProperties(this, {
        '$': { 'value': $, 'writable': false },
        '$id': { 'get': () => $.attributes[$.idAttribute] }
      });

      $.collection  = options.collection || undefined
      $.idAttribute = options.idAttribute || 'id'
      $.defaults    = options.defaults || {}

      $.cid = uniqueId(options.cidPrefix || 'm')

      $.attributes = {}
      $.changed = {}
    }

    $has(attr) {
      return attr in this.$.attributes;
    }

    get(attr) {
      return this.$.attributes[attr]
    }

    set(attrs, val, options = {}) {

      if ('object' == typeof (attrs)) val && (options = val);
      else (key => (attrs = {})[key] = val)(attrs);

      if (!this._validate(attrs, options)) {
        return false
      }

      this._previousAttributes = clone({}, this.attributes);
      this.changed = {};

      const unset = options.unset;
      const current = this.attributes;
      const changed = this.changed;
      const prev = this._previousAttributes;

      Object.keys(attrs).some(attr => {
        let val = attrs[attr];

        prev[attr] == val ?
          delete changed[attr] :
          changed[attr] = val;

        unset ?
          delete current[attr] :
          current[attr] = val;

      })

      this.idAttribute in attrs && (
        this.id = this.get(this.idAttribute)
      );

      return this;
    }

    unset(attr, options = {}) {
      return this.set(attr, undefined, clone(options, { 'unset': true }))
    }

    $has(attr) {
      return attr in this.$.attributes
    }

() {
    return this.$.attributes[this.$.idAttribute]
  }

  isNew() {
    return !this.has(this.$.idAttribute);
  }

  clear(options) {
    let attrs = {};
    Object.keys(this.attributes).some(attr => { attrs[attr] = undefined })
    return this.set(attrs, clone(options, { 'unset': true }))
  }

  hasChanged(attr) {
    return attr == null ?
      !!Object.keys(this.changed).length :
      attr in this.changed
  }

  changedAttributes() {
    return this.hasChanged() && clone(this.changed)
  }

  toJSON(options) {
    return clone(this.attributes);
  }

  url() {
    let id = this.isNew() ? '' : `/${this.getId()}`
    return `${super.url()}${id}`
  }

  fetch(options) {

    options = assign({ 'parse': true }, options);
    this.idAttribute in options && this.set(this.idAttribute, options[this.idAttribute]);
    let model = this;

    return new Promise((resolve, reject) => {

      if (model.isNew())
        reject({ 'error': 'modelo sem identificador' })

      else
        Sync.fetch.call(model, options)
          .then(({ attributes, response, options }) => {
            model.set(options.parse ? model.parse(attributes, options) : attributes, options)
            resolve({ model, response, options })
          })
    })
  }

  _validate(attrs, options) {
    if (!options.validate || !model.validate) return true
  }

}

class Collection extends Sync {

    constructor(models, options = {}) {
      super(options, () => { });
      this.model = options.model || Model;
      options.comparator && (this.comparator = options.comparator)
      this._reset();
      models && this.reset(models, options);
      Object.defineProperty(this, 'length', { 'writeable': false, 'get': () => this.models.length })
    }

    // collecion.set
    set(models, options) {

      console.log('----------------------------------------------------------------')
      console.log('collection.set --->')

      if (undefined == models) {
        console.log('<--- collection.set')
        console.log('----------------------------------------------------------------')
        return
      }

      options = assign({ 'add': true, 'remove': true, 'merge': true }, options);
      options.parse && !this._isModel(models) && (
        models = this.parse(models, options) || []
      );

      let singular = !isArray(models);
      singular && (models = [models])

      console.log('incluir --->    ', models)

      let { at, add, merge, remove } = options;
      let set = [], toAdd = [], toMerge = [], toRemove = [], modelMap = {}, sort = false;

      undefined == at || (at = +at);
      at > this.length && (at = this.length);
      at < 0 && (at += this.length + 1)

      let sortable = this.comparator && at == null && options.sort !== false;
      let sortAtt = 'string' == typeof (this.comparator) ? this.comparator : undefined

      models.some((model, i) => {

        let existing = this.get(model);

        console.log('existing', existing)
        console.log('add', add)
        console.log('remove', remove)

        if (existing) {

          if (merge && model !== existing) {
            let attrs = this._isModel(model) ? model.attributes : model;
            options.parse && (attrs = existing.parse(attrs, options));
            existing.set(attrs, options);
            toMerge.push(existing);
            sortable && !sort && (sort = existing.hasChanged(sortAtt))
          }

          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }

          models[i] = existing;
        }

        else if (add) {

          model = models[i] = this._prepareModel(model, options);

          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }

        }
      })

      if (remove) {
        this.models.filter(m => undefined == modelMap[m.cid]).some(m => toRemove.push(m))
        toRemove.length && this._removeModels(toRemove, options)
      }

      let replace = !sortable && add && remove;

      console.log('set.length', set.length)
      console.log('replace', replace)


      if (set.length && replace) {
        this.models.splice(this.length, 0, ...set);
      }

      else if (toAdd.length) {
        sortable && (sort = true);
        this.models.splice(toAdd, at || this.length)
      }

      console.log('<--- collection.set')
      console.log('----------------------------------------------------------------')
      return singular ? models[0] : models;
    }

    get(arg) {
      return undefined == arg ? undefined :
        this._byId[arg] ||
        this._byId[this.modelId(arg.attributes || arg)] ||
        arg.cid && this._byId[arg.cid]
    }

    has(arg) {
      return this.get(arg) != null
    }

    modelId(attrs) {
      return this.model &&
        this.model.idAttribute &&
        attrs[this.model.idAttribute];
    }

    toJSON(options) {
      return this.models.map(model => model.toJSON(options));
    }

    add(models, options) {
      return this.set(models, clone(options, { 'add': true, 'remove': true, 'merge': true }))
    }

    remove(models, options) {
      options = clone(options);
      const singular = !isArray(models);
      singular && (models = [models]);
    }

    parse(resp, opts) {

      if (resp && isArray(resp) && isArray(resp[0])) {
        resp = resp.splice(1).map(Sync._parse(resp[0]))
      }

      return resp
    }

    reset(models, options) {
      options = clone(options);
      this.models.some(model => this._removeReference(model, options))
      options.previousModels = this.models;
      this._reset();
      return this.add(models, options)
    }

    fetch(options) {

      options = assign({ 'parse': true }, options);
      let collection = this;

      return super.fetch.call(collection, options)
        .then(({ attributes, response, options }) => {
          collection[options.reset ? 'reset' : 'set'](attributes, options);
          return { collection, response, options }
        })
    }

    _prepareModel(attrs, options) {

      if (this._isModel(attrs)) {
        attrs.collection || (attrs.collection = this)
        return attrs
      }

      options = clone(options, { 'collection': this });

      let model = new this.model(attrs, options);

      return !model.validationError && model
    }

    _removeModels(models, options) {
      let removed = [];

      models.map(a => this.get(a)).filter(a => a).some(model => {

        console.log('-----------------')

        console.log(model)
        console.log(this.models)
        console.log(this.models.length)
        console.log(this.models.indexOf(model))

        this.models.splice(this.models.indexOf(model), 1);

        console.log(this.models)
        console.log(this.models.length)

        console.log('-----------------')
        removed.push(model);
        this._removeReference(model, options);
      })

      return removed
    }

    _addReference(model, options) {
      this._byId[model.cid] = model;
      let id = this.modelId(model.attributes);
      null == id || (this._byId[id] = model)
    }

    _removeReference(model, options) {
      delete this._byId[model.cid];
      (id => id != null && (delete this._byId[id]))(this.modelId(model.attributes));
      this === model.collection && (delete model.collection);
    }

    _isModel(model) {
      return model instanceof Model
    }

    _reset() {
      this.models = [];
      this._byId = {};
    }

  }

return { Collection, Model, Sync }
})