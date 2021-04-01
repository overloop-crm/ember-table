import Component from '@ember/component';
import { equal, bool, or } from '@ember/object/computed';
import { observer } from '../../-private/utils/observer';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';

export default Component.extend({
  // Provided by subclasses
  columnMeta: null,
  columnValue: null,

  classNameBindings: [
    'isFirstColumn',
    'isFirstFixed',
    'isLastFixed',
    'isFixedLeft',
    'isFixedRight',
    'hasWidth',
    'hasMinWidth',
    'hasMaxWidth',
    'textAlign',
  ],

  isFirstFixed: or('columnMeta.isFirstFixedLeft', 'columnMeta.isFirstFixedRight'),
  isLastFixed: or('columnMeta.isLastFixedLeft', 'columnMeta.isLastFixedRight'),
  isFirstColumn: equal('columnMeta.index', 0),
  isFixedLeft: equal('columnMeta.isFixed', 'left'),
  isFixedRight: equal('columnMeta.isFixed', 'right'),
  hasWidth: bool('columnMeta.width'),
  hasMinWidth: bool('columnMeta.minWidth'),
  hasMaxWidth: bool('columnMeta.maxWidth'),

  /**
   Indicates the text alignment of this cell
  */
  textAlign: computed('columnValue.textAlign', function() {
    let textAlign = this.get('columnValue.textAlign');

    if (['left', 'center', 'right'].includes(textAlign)) {
      return `ember-table__text-align-${textAlign}`;
    }

    return null;
  }),

  // eslint-disable-next-line
  scheduleUpdateStyles: observer(
    'columnMeta.{width,offsetLeft,offsetRight}',
    'isFixedLeft',
    'isFixedRight',

    function() {
      scheduleOnce('actions', this, 'updateStyles');
    }
  ),

  updateStyles() {
    if (typeof FastBoot === 'undefined' && this.element) {
      let width = `${this.get('columnMeta.width')}px`;
      let minWidth = `${this.get('columnMeta.minWidth')}px`;
      let maxWidth = `${this.get('columnMeta.maxWidth')}px`;

      this.element.style.width = width;
      this.element.style.minWidth = minWidth;
      this.element.style.maxWidth = maxWidth;

      this.element.style.textAlign = this.get('columnMeta.align') || '';

      if (this.get('isFixedLeft')) {
        let offsetLeft =
          this.get('columnMeta._node.parent.element.offsetLeft') ||
          this.get('columnMeta.offsetLeft');
        this.element.style.left = `${Math.round(offsetLeft)}px`;
      } else if (this.get('isFixedRight')) {
        let offsetRight =
          this.get('columnMeta._node.parent.element.offsetLeft') ||
          this.get('columnMeta.offsetLeft');
        this.element.style.right = `${Math.round(offsetRight)}px`;
      }
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.updateStyles();
  },
});
