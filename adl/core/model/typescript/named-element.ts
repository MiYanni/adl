import { anonymous, isAnonymous } from '@azure-tools/sourcemap';
import { BindingName, Identifier, NamedNodeSpecificBase, Node, PropertyName, ReferenceFindableNode, RenameableNode } from 'ts-morph';
import { getFirstDoc, getTagValue, setTag } from '../../support/doc-tag';
import { Identity } from '../types';
import { Range } from './position';
import { RemovableNode } from './removable-node';
import { TSElement } from './typescript-element';

export type NamedElementNode = Node & NamedNodeSpecificBase<Identifier | PropertyName | BindingName> & ReferenceFindableNode & RenameableNode & RemovableNode

export class NamedElement<TNode extends NamedElementNode> extends TSElement<TNode> {
  remove() {
    this.node.remove();
  }

  get range(): Range {
    return Range.fromNode(this.node.getNameNode());
  }

  get name(): Identity {
    let result: Identity | undefined = undefined;
    result = this.node.getName();
    return result ?? anonymous(this.node.getKindName());
  }

  set name(value: Identity) {
    if (isAnonymous(value)) {
      throw new Error('Cannot rename this node to anonymous.');
    }
    this.node.rename(value);
  }

  get summary() {
    return getFirstDoc(this.node).getDescription().trim();
  }

  set summary(value: string) {
    getFirstDoc(this.node).setDescription(value || '\n');
  }

  get description() {
    return getTagValue(this.node, 'description')?.trim();
  }
  set description(value: string | undefined) {
    setTag(this.node, 'description', value);
  }
}
