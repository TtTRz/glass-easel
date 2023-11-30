/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BaseBehaviorBuilder } from './base_behavior_builder'
import { Behavior } from '../behavior'
import type { BehaviorDefinition, utils as typeUtils } from '../types'
import type { DefinitionFilter, GeneralBehavior } from '../behavior'
import type { AllData, Component, GeneralComponent } from '../component'
import type { CodeSpace } from '../space'
import type { ResolveBehaviorBuilder, BuilderContext } from './type_utils'

type Empty = typeUtils.Empty
type DataList = typeUtils.DataList
type PropertyList = typeUtils.PropertyList
type PropertyType = typeUtils.PropertyType
type PropertyTypeToValueType<T extends PropertyType> = typeUtils.PropertyTypeToValueType<T>
type MethodList = typeUtils.MethodList
type ChainingFilterType = typeUtils.ChainingFilterType
type ComponentMethod = typeUtils.ComponentMethod
type TaggedMethod<Fn extends ComponentMethod> = typeUtils.TaggedMethod<Fn>
type ChainingFilterFunc<
  TAddedFields extends { [key: string]: any },
  TRemovedFields extends string = never,
> = typeUtils.ChainingFilterFunc<TAddedFields, TRemovedFields>

export class BehaviorBuilder<
  TPrevData extends DataList = Empty,
  TData extends DataList = Empty,
  TProperty extends PropertyList = Empty,
  TMethod extends MethodList = Empty,
  TChainingFilter extends ChainingFilterType = never,
  TPendingChainingFilter extends ChainingFilterType = never,
  TComponentExport = never,
> extends BaseBehaviorBuilder<
  TPrevData,
  TData,
  TProperty,
  TMethod,
  TChainingFilter,
  TPendingChainingFilter,
  TComponentExport
> {
  private _$definitionFilter: DefinitionFilter | undefined

  /** @internal */
  static create(codeSpace: CodeSpace): BehaviorBuilder {
    const ret = new BehaviorBuilder()
    ret._$codeSpace = codeSpace
    ret._$ = codeSpace.getComponentSpace().defineWithMethodCaller()
    return ret
  }

  /** Define a chaining filter */
  chainingFilter<
    TAddedFields extends { [key: string]: any },
    TRemovedFields extends string = never,
  >(
    func: ChainingFilterFunc<TAddedFields, TRemovedFields>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod,
      TChainingFilter,
      {
        add: TAddedFields
        remove: TRemovedFields
      },
      TComponentExport
    >,
    TChainingFilter
  > {
    this._$.chainingFilter(func as any)
    return this as any
  }

  /** Use another behavior */
  behavior<
    UData extends DataList,
    UProperty extends PropertyList,
    UMethod extends MethodList,
    UChainingFilter extends ChainingFilterType,
  >(
    behavior: Behavior<UData, UProperty, UMethod, UChainingFilter>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData & UData,
      TProperty & UProperty,
      TMethod & UMethod,
      UChainingFilter,
      TPendingChainingFilter,
      TComponentExport
    >,
    UChainingFilter
  > {
    this._$parents.push(behavior as GeneralBehavior)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._$ = this._$.behavior(behavior._$)
    return this as any
  }

  /** Set the export value when the component is being selected */
  override export<TNewComponentExport>(
    f: (this: GeneralComponent, source: GeneralComponent | null) => TNewComponentExport,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TNewComponentExport
    >,
    TChainingFilter
  > {
    return super.export(f) as any
  }

  /**
   * Add some template data fields
   *
   * It does not support raw data, but a `gen` function which returns the new data fields.
   * The `gen` function executes once during component creation.
   */
  override data<T extends DataList>(
    gen: () => typeUtils.NewFieldList<AllData<TData, TProperty>, T>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      T,
      TData & T,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport
    >,
    TChainingFilter
  > {
    return super.data(gen) as any
  }

  /**
   * Add a single property
   *
   * The property name should be different from other properties.
   */
  override property<N extends string, T extends PropertyType, V extends PropertyTypeToValueType<T>>(
    name: N,
    def: N extends keyof (TData & TProperty) ? never : typeUtils.PropertyListItem<T, V>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData,
      TProperty & Record<N, unknown extends V ? T : typeUtils.PropertyOption<T, V>>,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport
    >,
    TChainingFilter
  > {
    return super.property(name, def) as any
  }

  /**
   * Add some public methods
   *
   * The public method can be used as an event handler, and can be visited in component instance.
   */
  override methods<T extends MethodList>(
    funcs: T & ThisType<Component<TData, TProperty, TMethod & T, any>>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod & T,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport
    >,
    TChainingFilter
  > {
    return super.methods(funcs) as any
  }

  /**
   * Execute a function while component instance creation
   *
   * A `BuilderContext` is provided to tweak the component creation progress.
   * The return value is used as the "export" value of the behavior,
   * which can be imported by other behaviors.
   */
  override init<TExport extends Record<string, TaggedMethod<(...args: any[]) => any>> | void>(
    func: (
      this: Component<TData, TProperty, TMethod, TComponentExport>,
      builderContext: BuilderContext<
        TPrevData,
        TProperty,
        Component<TData, TProperty, TMethod, TComponentExport>
      >,
    ) => TExport,
    // eslint-disable-next-line function-paren-newline
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport
    >,
    TChainingFilter
  > {
    return super.init(func) as any
  }

  /** Apply a classic definition object */
  override definition<
    TNewData extends DataList = Empty,
    TNewProperty extends PropertyList = Empty,
    TNewMethod extends MethodList = Empty,
    TNewComponentExport = never,
  >(
    def: BehaviorDefinition<TNewData, TNewProperty, TNewMethod, TNewComponentExport> &
      ThisType<
        Component<
          TData & TNewData,
          TProperty & TNewProperty,
          TMethod & TNewMethod,
          TNewComponentExport
        >
      >,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
      TPrevData,
      TData & TNewData,
      TProperty & TNewProperty,
      TMethod & TNewMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TNewComponentExport
    >,
    TChainingFilter
  > {
    super.definition(def)
    if (def.definitionFilter) this._$definitionFilter = def.definitionFilter
    return this as any
  }

  /**
   * Finish the behavior definition process
   */
  register(): Behavior<TData, TProperty, TMethod, TPendingChainingFilter, TComponentExport> {
    return new Behavior(
      this._$.registerBehavior(),
      this._$parents,
      this._$definitionFilter,
      this._$export,
    )
  }
}
