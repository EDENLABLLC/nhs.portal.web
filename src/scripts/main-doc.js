import { $ } from './dom';
import Tabs from './tabs';

$('.tabs').forEach(node => new Tabs(node, { autoHeight: true }));