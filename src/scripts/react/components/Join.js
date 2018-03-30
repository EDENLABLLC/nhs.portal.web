import React from "react";

import TabView from "./TabView";
import InfoTooltip from "./InfoTooltip";

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
                    ЕЦП керівника медичного закладу
                    <InfoTooltip>
                      ЕЦП від суб’єкта господарювання для керівника закладу
                    </InfoTooltip>
                  </div>
                </li>
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">документи закладу</li>
                <li className="join-rules__list-item">
                  <div>
                    особисті документи
                    <InfoTooltip>паспорт та податковий номер</InfoTooltip>
                  </div>
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  Обрати одну з <br />
                  <b>медичних інформаційних систем </b>
                  <InfoTooltip>
                    Усі функції, необхідні для роботи з центральним компонентом
                    системи eHealth надаються безкоштовно
                  </InfoTooltip>
                  підключених до системи eHealth
                </li>
                <li className="join-rules__next-list-item">
                  Заповнити поля про медичний заклад та керівника медичного
                  закладу, обов’язково вказавши GPS-координати місць надання
                  послуг
                </li>
                <li className="join-rules__next-list-item">
                  Накласти ЕЦП керівника медичного закладу
                </li>
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у запрошенні <br />
                  до системи eHealth{" "}
                  <InfoTooltip>
                    Ви отримаєте лист на вказану робочу електронну адресу
                  </InfoTooltip>, що прийде на електронну пошту
                </li>
                <li className="join-rules__next-list-item">
                  Затвердити обліковий запис користувача для керівника медичного
                  закладу
                </li>
                <li className="join-rules__next-list-item">
                  Призначити одну або декілька Уповноважених осіб для роботи в
                  системі
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>
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
              <ul className="join-rules__next-list join-rules__next-list_five">
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у <br />
                  <b>запрошенні до системи eHealth</b>
                  <InfoTooltip>
                    Ви отримаєте лист на вашу робочу електронну адресу
                  </InfoTooltip>, що прийде на електронну пошту
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
                  форму Декларації
                </li>
                <li className="join-rules__next-list-item">
                  Вказати код, що пацієнт отримав <br />
                  у СМС-повідомленні
                </li>
                <li className="join-rules__next-list-item">
                  Зберегти копії документів пацієнта (скан або фото або паперова
                  версія)
                </li>
                <li className="join-rules__next-list-item">
                  Роздрукувати заповнену Декларацію <br />
                  у двох примірниках: <br />
                  один – пацієнту, один – лікарю.
                </li>
                <li className="join-rules__next-list-item">
                  Надати Декларацію <br />
                  для підписання пацієнту
                </li>
                <li className="join-rules__next-list-item">
                  Накласти власний ЕЦП працівника <br />
                  медичного закладу на електронну <br />
                  форму Декларації як підтвердження її підписання
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>
            </section>
          )
        },
        {
          title: (
            <div>
              Уповноважена <br />
              особа
            </div>
          ),
          content: (
            <section key="authorized-person" className="join-rules">
              <h2 className="join-rules__title">Ви Уповноважена особа</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>
              <ul className="join-rules__list">
                <li className="join-rules__list-item">ЕЦП</li>
                <li className="join-rules__list-item">
                  робочу адресу електронної пошти
                </li>
                <li className="join-rules__list-item">документи пацієнта</li>
              </ul>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_five">
                <li className="join-rules__next-list-item">
                  Перейти за посиланням у <br />
                  <b>запрошенні до системи eHealth</b>, що прийде на електронну
                  пошту
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
                  Ввести дані пацієнта в електронну <br />
                  форму Декларації
                </li>
                <li className="join-rules__next-list-item">
                  Вказати код, що пацієнт отримав <br />
                  у СМС-повідомленні
                </li>
                <li className="join-rules__next-list-item">
                  Зберегти копії документів пацієнта (скан або фото або паперова
                  версія)
                </li>
                <li className="join-rules__next-list-item">
                  Роздрукувати заповнену Декларацію <br />
                  у двох примірниках: <br />
                  один – пацієнту, один – закладу
                </li>
                <li className="join-rules__next-list-item">
                  Надати Декларацію<br />для підписання пацієнту
                </li>
                <li className="join-rules__next-list-item">
                  Накласти власний ЕЦП на електронну <br />
                  форму Декларації як підтвердження її підписання
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>
            </section>
          )
        },
        {
          title: "Пацієнт",
          content: (
            <section key="patient" className="join-rules">
              <h2 className="join-rules__title">Ви Пацієнт</h2>
              <h3 className="join-rules__sub-title">НЕОБХІДНО МАТИ</h3>

              <TabView>
                {[
                  {
                    title: "Дієздатним особам",
                    content: (
                      <ul className="join-rules__list">
                        <li className="join-rules__list-item">
                          мобільний телефон
                        </li>
                        <li className="join-rules__list-item">
                          податковий номер
                        </li>
                        <li className="join-rules__list-item">
                          документ, що посвідчує особу
                          <InfoTooltip>
                            <h5 className="join-rules__list-tooltip-title">
                              один з нижчеперерахованих документів:
                            </h5>
                            <ul className="join-rules__list-tooltip-list">
                              <li>паспорт громадянина України</li>
                              <li>тимчасове посвідчення громадянина України</li>
                              <li>посвідка на постійне проживання в Україні</li>
                              <li>посвідчення біженця</li>
                              <li>
                                посвідчення особи, яка потребує додаткового
                                захисту
                              </li>
                            </ul>
                          </InfoTooltip>
                        </li>
                      </ul>
                    )
                  },
                  {
                    title: "Дітям до 14 років",
                    content: (
                      <ul className="join-rules__list">
                        <li className="join-rules__list-item">
                          мобільний телефон
                        </li>
                        <li className="join-rules__list-item">
                          свідоцтво про народження
                        </li>
                        <li className="join-rules__list-item">
                          податковий номер одного з батьків
                        </li>
                        <li className="join-rules__list-item">
                          документ, що посвідчує особу одного з батьків
                          <InfoTooltip>
                            <h5 className="join-rules__list-tooltip-title">
                              один з нижчеперерахованих документів:
                            </h5>
                            <ul className="join-rules__list-tooltip-list">
                              <li>паспорт громадянина України</li>
                              <li>тимчасове посвідчення громадянина України</li>
                              <li>посвідка на постійне проживання в Україні</li>
                              <li>посвідчення біженця</li>
                              <li>
                                посвідчення особи, яка потребує додаткового
                                захисту
                              </li>
                            </ul>
                          </InfoTooltip>
                        </li>
                      </ul>
                    )
                  },
                  {
                    title: "Недієздатним особам",
                    content: (
                      <ul className="join-rules__list">
                        <li className="join-rules__list-item">
                          <div>мобільний телефон</div>
                        </li>
                        <li className="join-rules__list-item">
                          ІПН недієздатної особи та документ, що посвідчує особу
                          <InfoTooltip>
                            <h5 className="join-rules__list-tooltip-title">
                              один з нижчеперерахованих документів:
                            </h5>
                            <ul className="join-rules__list-tooltip-list">
                              <li>паспорт громадянина України</li>
                              <li>тимчасове посвідчення громадянина України</li>
                              <li>посвідка на постійне проживання в Україні</li>
                              <li>посвідчення біженця</li>
                              <li>
                                посвідчення особи, яка потребує додаткового
                                захисту
                              </li>
                            </ul>
                          </InfoTooltip>
                        </li>
                        <li className="join-rules__list-item">
                          ІПН законного представника та документ, що посвідчує
                          особу
                          <InfoTooltip>
                            <h5 className="join-rules__list-tooltip-title">
                              один з нижчеперерахованих документів:
                            </h5>
                            <ul className="join-rules__list-tooltip-list">
                              <li>паспорт громадянина України</li>
                              <li>тимчасове посвідчення громадянина України</li>
                              <li>посвідка на постійне проживання в Україні</li>
                              <li>посвідчення біженця</li>
                              <li>
                                посвідчення особи, яка потребує додаткового
                                захисту
                              </li>
                            </ul>
                          </InfoTooltip>
                        </li>
                        <li className="join-rules__list-item">
                          посвідчення законного представника
                        </li>
                      </ul>
                    )
                  }
                ]}
              </TabView>
              <h3 className="join-rules__sub-title">ДАЛІ</h3>
              <ul className="join-rules__next-list join-rules__next-list_three">
                <li className="join-rules__next-list-item">
                  Обрати заклад та лікаря, з яким <br />
                  хотіли б підписати Декларацію
                </li>
                <li className="join-rules__next-list-item">
                  Взявши особисті документи, <br />
                  <b>звернутись до закладу</b>
                </li>
                <li className="join-rules__next-list-item">
                  Вказати прізвище обраного лікаря <br />
                  та надати документи для введення <br />
                  даних в електронну форму декларації, в тому числі – номер
                  мобільного телефону та документи
                </li>
                <li className="join-rules__next-list-item">
                  Назвати код, який прийшов в смс-повідомлені
                </li>
                <li className="join-rules__next-list-item">
                  Перевірити свої дані у роздрукованих<br />
                  примірниках Декларації<br />
                  та підписати їх
                </li>
                <li className="join-rules__next-list-item">
                  Забрати свій примірник декларації
                </li>
              </ul>
              <h3 className="join-rules__sub-title">ГОТОВО!</h3>
            </section>
          )
        }
      ]}
    </TabView>
  </section>
);

export default Join;
