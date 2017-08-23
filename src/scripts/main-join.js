import { $ } from './dom';
import Tabs from './tabs';
import Back from './back';

$('.tabs').forEach(node => new Tabs(node));
$('.js-back-link').forEach(node => new Back(node));
