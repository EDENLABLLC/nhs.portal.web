import React from "react";
import TabView from "./TabView";

const Join = () => (
  <section className="join-page">
    <h1 className="join-page__title">Як приєднатися до системи eHealth</h1>

    <TabView theme="large">
      {[
        {
          title: (
            <div>
              Керівник<br />
              медичного<br />
              закладу
            </div>
          ),
          content: (
            <section key="manager" className="join-rules">
              <h2 className="join-rules__title">
                Ви Керівник медичного закладу
              </h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">
                  <div>
                    ЕЦП керівника медичного закладу&nbsp;
                    <div
                      className="tooltip join-rules__list-tooltip"
                      data-message="ЕЦП від суб’єкта господарювання для керівника закладу"
                    />
                  </div>
                </li>
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">документи закладу</li>
                <li className="join-rules__list-item">
                  <div>
                    особисті документи&nbsp;
                    <div
                      className="tooltip join-rules__list-tooltip"
                      data-message="паспорт та податковий номер"
                    />
                  </div>
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  Обрати одну з <br />
                  <b>медичних інформаційних систем </b>
                  <div
                    className="tooltip join-rules__list-tooltip"
                    data-message="Усі функції, необхідні для роботи з центральним компонентом системи eHealth надаються безкоштовно"
                  />
                  підключених до системи eHealth
                </li>
                <li className="join-rules__next-list-item">
                  Заповнити поля про медичний заклад та керівника медичного
                  закладу
                </li>
                <li className="join-rules__next-list-item">
                  Накласти ЕЦП керівника медичного закладу
                </li>
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у запрошенні <br />
                  до системи eHealth
                  <div
                    className="tooltip join-rules__list-tooltip"
                    data-message=" Ви отримаєте лист на вказану робочу електронну адресу"
                  />, що прийде на електронну пошту
                </li>
                <li className="join-rules__next-list-item">
                  Затвердити обліковий запис користувача для керівника медичного
                  закладу
                </li>
                <li className="join-rules__next-list-item">
                  За потреби запросити працівника відділу кадрів
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>
              <p className="join-rules__attention">
                Важливо! Заповнена та підписана форма надає закладові статус:
                заявка на участь у реформі фінансування первинної ланки у 2017
                році задекларована. На наступному етапі подані дані буде
                верифіковано відповідно до ЄДР про код ЄДРПОУ та КВЕД, та
                автоматизованою базою даних медичних, фармацевтичних та
                науково-педагогічних працівників сфери управління МОЗ України.
              </p>

              <footer className="join-rules__footer">
                <a className="join-rules__button btn" href="/providers.html">
                  Долучитись до eHealth
                </a>
              </footer>
            </section>
          )
        },
        {
          title: (
            <div>
              Лікар <br />
              первинної <br />
              ланки
            </div>
          ),
          content: (
            <section key="doctor" className="join-rules">
              <h2 className="join-rules__title">Ви Лікар первинної ланки</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">
                  ЕЦП працівника медичного закладу
                </li>
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">документи пацієнта</li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_four">
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у <br />
                  <b>запрошенні до системи eHealth</b>
                  <div
                    className="tooltip join-rules__list-tooltip"
                    data-message="Ви отримаєте лист на вашу робочу електронну адресу"
                  />
                  , що прийде на електронну пошту
                </li>
                <li className="join-rules__next-list-item">
                  Затвердити власний <br />
                  обліковий запис користувача
                </li>
                <li className="join-rules__next-list-item">
                  В медичній інформаційній <br />
                  системі перейти до підписання <br />
                  Декларацій з пацієнтами
                </li>
                <li className="join-rules__next-list-item">
                  Ввести дані пацієнта у електронну <br />
                  форму Декларації або перевірити <br />
                  достовірність попередньо введених Реєстратором
                </li>
                <li className="join-rules__next-list-item">
                  Вказати код, що пацієнт отримав <br />
                  у СМС-повідомленні, або прикріпити <br />
                  фото/скан копії його документів
                </li>
                <li className="join-rules__next-list-item">
                  Роздрукувати заповнену Декларацію <br />
                  у двох примірниках: <br />
                  один – пацієнту, один – лікарю.
                </li>
                <li className="join-rules__next-list-item">
                  Підписати примірники Декларації <br />
                  разом з пацієнтом.
                </li>
                <li className="join-rules__next-list-item">
                  Накласти власний ЕЦП працівника <br />
                  медичного закладу на електронну <br />
                  форму Декларації як підтвердження її підписання
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>

              <footer className="join-rules__footer">
                <a className="join-rules__button btn" href="/providers.html">
                  Увійти до системи eHealth
                </a>
              </footer>
            </section>
          )
        },
        {
          title: "Пацієнт",
          content: (
            <section key="patient" className="join-rules">
              <h2 className="join-rules__title">Ви Пацієнт</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">
                  паспорт або свідоцтво про народження для дитини
                </li>
                <li className="join-rules__list-item">
                  <div>
                    податковий номер&nbsp;
                    <div
                      className="tooltip join-rules__list-tooltip"
                      data-message="за наявності"
                    />
                  </div>
                </li>
                <li className="join-rules__list-item">
                  <div>
                    мобільний телефон&nbsp;
                    <div
                      className="tooltip join-rules__list-tooltip"
                      data-message="за наявності"
                    />
                  </div>
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  На сайті eHealth в розділі “Мапа” <br />
                  ознайомитись з{" "}
                  <a href="/divisions.html">
                    <b>мапою</b>
                  </a>
                  <br />
                  зареєстрованих закладів та лікарів
                </li>
                <li className="join-rules__next-list-item">
                  Обрати заклад та лікаря, з яким <br />
                  хотіли б підписати Декларацію
                </li>
                <li className="join-rules__next-list-item">
                  Взявши особисті документи, <br />
                  <b>звернутись до закладу</b>
                  <div
                    className="tooltip tooltip_br join-rules__list-tooltip join-rules__list-tooltip"
                    data-message="Для підписання Декларації з особами, які знаходяться під опікою,&#013; необхідно мати: особисті документи опікуна/-ів, документи особи під опікою, та документи,&#013; що посвідчують факт представництва (посвідчення або рішення суду)"
                  />
                </li>
                <li className="join-rules__next-list-item">
                  Вказати прізвище обраного лікаря <br />
                  та надати документи для введення <br />
                  даних в електронну форму декларації
                </li>
                <li className="join-rules__next-list-item">
                  Перевірити свої дані у роздрукованих <br />
                  примірниках Декларації <br />
                  та підписати їх
                </li>
                <li className="join-rules__next-list-item">
                  Забрати свій примірник декларації
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>

              <footer className="join-rules__footer">
                <a className="join-rules__button btn" href="/divisions.html">
                  Обрати заклад на мапі
                </a>
              </footer>
            </section>
          )
        },
        {
          title: (
            <div>
              Працівник<br />
              відділу<br />
              кадрів
            </div>
          ),
          content: (
            <section key="hr" className="join-rules">
              <h2 className="join-rules__title">Ви Працівник відділу кадрів</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">особисті документи</li>
                <li className="join-rules__list-item">
                  інформацію про особисті документи лікарів
                </li>
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти кожного лікаря
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у <br />
                  <b>запрошенні до системи eHealth</b>&nbsp;
                  <div
                    className="tooltip join-rules__list-tooltip"
                    data-message="Ви отримаєте лист на робочу електронну адресу"
                  />
                  ,<br />
                  що прийде на електронну пошту
                </li>
                <li className="join-rules__next-list-item">
                  Затвердити власний обліковий запис користувача
                </li>
                <li className="join-rules__next-list-item">
                  В медичній інформаційній системі заповнити поля про кожного
                  лікаря первинної ланки
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>

              <footer className="join-rules__footer">
                <a className="join-rules__button btn" href="/providers.html">
                  Увійти до системи eHealth
                </a>
              </footer>
            </section>
          )
        },
        {
          title: (
            <div>
              Працівник<br />
              реєстратури
            </div>
          ),
          content: (
            <section key="employee" className="join-rules">
              <h2 className="join-rules__title">Ви Працівник реєстратури</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">особисті документи</li>
                <li className="join-rules__list-item">документи пацієнта</li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у <br />
                  <b>запрошенні до системи eHealth</b>
                  <div
                    className="tooltip join-rules__list-tooltip"
                    data-message="Ви отримаєте лист на робочу електронну адресу"
                  />
                  ,<br /> що прийде на електронну пошту
                </li>
                <li className="join-rules__next-list-item">
                  Затвердити власний <br />
                  обліковий запис користувача
                </li>
                <li className="join-rules__next-list-item">
                  В обраній медичній інформаційній системі <br />
                  ввести дані з документів пацієнта <br />
                  у електронну форму Декларації
                </li>
                <li className="join-rules__next-list-item">
                  Вказати код, що пацієнт отримав <br />
                  у СМС-повідомленні, або прикріпити <br />
                  фото/скан копії його документів
                </li>
                <li className="join-rules__next-list-item">
                  За потреби роздрукувати заповнену <br />
                  Декларацію у двох примірниках: <br />
                  один – пацієнту, один – лікарю.
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>

              <footer className="join-rules__footer">
                <a className="join-rules__button btn" href="/providers.html">
                  Увійти до системи eHealth
                </a>
              </footer>
            </section>
          )
        }
      ]}
    </TabView>
  </section>
);

export default Join;
